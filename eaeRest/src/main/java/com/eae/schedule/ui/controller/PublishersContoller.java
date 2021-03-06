package com.eae.schedule.ui.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.eae.communication.email.EmailUtils;
import com.eae.schedule.model.CartPoint;
import com.eae.schedule.model.Consent;
import com.eae.schedule.model.ConsentStatus;
import com.eae.schedule.model.Publisher;
import com.eae.schedule.model.PublisherAssignment;
import com.eae.schedule.model.ServicePeriod;
import com.eae.schedule.model.Shift;
import com.eae.schedule.repo.CartPointRepository;
import com.eae.schedule.repo.ConsentRepository;
import com.eae.schedule.repo.PublisherAssignmentRepository;
import com.eae.schedule.repo.PublisherRepository;
import com.eae.schedule.repo.ServicePeriodRepository;
import com.eae.schedule.repo.ShiftRepository;
import com.eae.schedule.ui.model.LandingDTO;
import com.eae.schedule.ui.model.Response;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/publishers")
public class PublishersContoller {
	
	@Autowired
	private PublisherRepository publisherRepo;
	
	@Autowired
	private ServicePeriodRepository periodRepo;

	@Autowired
	private PublisherAssignmentRepository publisherAssignmentRepo;
	
	@Autowired
	private ShiftRepository shiftRepo;
	
	@Autowired
	private ConsentRepository consentRepo;
	
	@Autowired
	private CartPointRepository cartPointRepo;
	
    @RequestMapping(name="/", method=RequestMethod.GET)
    public Response<Publisher> getAll() {
    	Response<Publisher> response = new Response<Publisher>();
    	List<Publisher> publishers = (List<Publisher>) this.publisherRepo.findAll();

    	for(Publisher publisher : publishers) {
    		publisher.setPassword(null);
    		publisher.setPinCode(null);
    	}
    	
    	response.setObjects(publishers);
        return response; 
    }
    
	@RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<Publisher> createPublisher(@RequestBody Publisher publisher) {
		Response<Publisher> response = new Response<Publisher>();
		publisher = this.publisherRepo.save(publisher);
		response.addObject(publisher);
		return response;
	}
	
	@RequestMapping(value="/updateMyProfile", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<Publisher> updateMyProfile(@RequestBody Publisher publisher) {
		Response<Publisher> response = this.updatePublisher(publisher);
		Publisher savedPublisher = response.getObjects().get(0);
		if(savedPublisher != null) {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			@SuppressWarnings("unchecked")
			List<GrantedAuthority> grantedAuths = (List<GrantedAuthority>) authentication.getAuthorities();
			Authentication auth = new UsernamePasswordAuthenticationToken(savedPublisher, savedPublisher.getEmail() + ":" + savedPublisher.getPinCode(), grantedAuths);
			SecurityContextHolder.getContext().setAuthentication(auth);
		}
		return response;
	}
	
	@RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<Publisher> updatePublisher(@RequestBody Publisher publisher) {
		Response<Publisher> response = new Response<Publisher>();
		Optional<Publisher> savedPubOptional = this.publisherRepo.findById(publisher.getGuid());
		
		if(savedPubOptional.isPresent()) {
			Publisher savedPublisher = savedPubOptional.get(); 
			savedPublisher.setName(publisher.getName());
			savedPublisher.setSurname(publisher.getSurname());
			savedPublisher.setCongregation(publisher.getCongregation());
			savedPublisher.setEmail(publisher.getEmail());
			savedPublisher.setTelephone(publisher.getTelephone());
			savedPublisher.setIsAdmin(publisher.getIsAdmin());
			savedPublisher.setLanguage(publisher.getLanguage());
			if(publisher.getPinCode() != 0) {
				savedPublisher.setPinCode(publisher.getPinCode());				
			}

			this.publisherRepo.saveAndFlush(savedPublisher);
			response.addObject(savedPublisher);
		}
		
		
		return response;
	}
	
	@RequestMapping(value="/delete/{publisherId}", method=RequestMethod.DELETE)
    public Response<Object> deletePeriod(@PathVariable(value="publisherId") String publisherId) {
    	Response<Object> response = new Response<Object>();
    	Publisher publisher = this.publisherRepo.findById(publisherId).get();
    	List<PublisherAssignment> assignments2Delete = this.publisherAssignmentRepo.findByPublisher(publisher);
    	
    	for(PublisherAssignment assignment : assignments2Delete) {
    		Shift shift = assignment.getShift();
    		shift.getAssignments().remove(assignment);
    		this.shiftRepo.save(shift);
    	}
    	
    	this.publisherAssignmentRepo.deleteInBatch(assignments2Delete);
    	publisherAssignmentRepo.flush();
    	this.publisherRepo.deleteById(publisherId);
    	return response;
    }
	
	@RequestMapping(value="/whoAmI", method=RequestMethod.GET)
	public LandingDTO findCurrentUser() {
		LandingDTO landingData = new LandingDTO();
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		Object currentPrincipal = authentication.getPrincipal();
		
		List<ServicePeriod> periods = this.periodRepo.findServicePeriodByIsShared(true);
		
		if(periods.size() > 0) {
			landingData.setCurrentPeriod(periods.get(0));
		}
		
		if(currentPrincipal instanceof  Publisher) {
			landingData.setPublisher((Publisher)currentPrincipal);
		} else {
			Publisher annonymous = new Publisher();
			annonymous.setEmail("ANONYMOUS");
			landingData.setPublisher(annonymous);
		}
		
		return landingData;
	}
	
	@RequestMapping(value = "/download", method = RequestMethod.GET)
	public ResponseEntity<byte[]> downloadPublishers() throws Exception {

	    List<Publisher> periods = (List<Publisher>) this.publisherRepo.findAll();
	    ObjectMapper mapper = new ObjectMapper();
	    byte[] output = mapper.writeValueAsBytes(periods);

	    HttpHeaders responseHeaders = new HttpHeaders();
	    responseHeaders.set("charset", "utf-8");
	    responseHeaders.setContentType(MediaType.valueOf("text/json"));
	    responseHeaders.setContentLength(output.length);
	    responseHeaders.set("Content-disposition", "attachment; filename=Publishers.json");

	    return new ResponseEntity<byte[]>(output, responseHeaders, HttpStatus.OK);
	}
    
	@RequestMapping(value = "/upload", method = RequestMethod.POST, consumes={"application/json"})
	public HttpStatus upload(@RequestBody ArrayList<Publisher> pubishers) {
		try {
			this.publisherRepo.saveAll(pubishers);
		} catch (Exception e) {
			return HttpStatus.INTERNAL_SERVER_ERROR; 
		
		}
        return HttpStatus.OK; 
	}
	
	@RequestMapping(value = "/setDefaultPin/{publisherId}", method = RequestMethod.GET)
	public Response<Publisher> setDefaultPin(@PathVariable(value="publisherId") String publisherId) {
		Response<Publisher> response = new Response<Publisher>();
		Publisher savedPublisher = this.publisherRepo.findById(publisherId).get();
		savedPublisher.setPinCode(101914);
		this.publisherRepo.saveAndFlush(savedPublisher);
		response.addObject(savedPublisher);
		response.setSuccessful(true);
		
		EmailUtils.sendEmail("Defaut Pin Code to EAE", "New Pin code: 101914", savedPublisher.getEmail());
		return response;
	}
	
	@RequestMapping(value = "/read/{publisherId}", method = RequestMethod.GET)
	public Response<Publisher> readPublisher(@PathVariable(value="publisherId") String publisherId) {
		Response<Publisher> response = new Response<Publisher>();
		Publisher publisher = this.publisherRepo.findById(publisherId).get();
		response.addObject(publisher);
		response.setSuccessful(true);
		return response;
	}
	
	@RequestMapping(value = "/concent/publisher/{publisherId}", method = RequestMethod.POST, consumes = {MediaType.APPLICATION_JSON_VALUE})
	public Response<Publisher> concent(@PathVariable(value="publisherId") String publisherId, @RequestBody Map<String, String> map) {
		Response<Publisher> response = new Response<Publisher>();
		Publisher publisher = this.publisherRepo.findById(publisherId).get();
		String concentStatusConde = map.get("concentStatusCode");
		Consent concent = new Consent();
		if("YES".equals(concentStatusConde)) {
			concent.setStatus(ConsentStatus.YES);
		} else {
			concent.setStatus(ConsentStatus.NO);
		}
		concent.setPublisher(publisher);
		publisher.setConsent(concent);
		
		this.consentRepo.save(concent);
		this.publisherRepo.save(publisher);
		
		response.addObject(publisher);
		response.setSuccessful(true);
		return response;
	}
	
	@RequestMapping(value="/assignToCart/publisher/{publisherId}/cart/{cartLocationId}", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<Publisher> assignCartToPublisher(@PathVariable(value="publisherId") String publisherId, @PathVariable(value="cartLocationId") String cartLocationId) {
		Response<Publisher> response = new Response<Publisher>();
		Publisher publisher = this.publisherRepo.findById(publisherId).get();
		CartPoint cartPoint = this.cartPointRepo.findById(cartLocationId).get();
		publisher.getCarts().add(cartPoint);
		this.publisherRepo.save(publisher);
		this.publisherRepo.flush();
		return response;
	}
	
	@RequestMapping(value="/unassignFromCart/publisher/{publisherId}/cart/{cartLocationId}", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<Publisher> unassignFromCartPublisher(@PathVariable(value="publisherId") String publisherId, @PathVariable(value="cartLocationId") String cartLocationId) {
		Response<Publisher> response = new Response<Publisher>();
		Publisher publisher = this.publisherRepo.findById(publisherId).get();

		CartPoint cart2Remove = null;
		for(CartPoint cart : publisher.getCarts()) {
			if(cart.getGuid().equalsIgnoreCase(cartLocationId)) {
				cart2Remove = cart;
				break;
			}
		}
		
		publisher.getCarts().remove(cart2Remove);
		this.publisherRepo.save(publisher);
		this.publisherRepo.flush();
		return response;
	}
	
	
	@RequestMapping(value="/assignedToCarts/publisher/{publisherId}", method=RequestMethod.GET, consumes={"application/json"}, produces={"application/json"})
	public Response<Publisher> getAssignedPublishersToCart(@PathVariable(value="publisherId") String publisherId, @PathVariable(value="cartLocationId") String cartLocationId) {
		Response<Publisher> response = new Response<Publisher>();
		return response;
	}
}
