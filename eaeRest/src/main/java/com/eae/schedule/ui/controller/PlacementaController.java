package com.eae.schedule.ui.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.eae.schedule.model.Placement;
import com.eae.schedule.model.PlacementTitle;
import com.eae.schedule.repo.PlacementTitleRepository;
import com.eae.schedule.repo.PlacementsRepository;
import com.eae.schedule.ui.model.Response;

@RestController
@RequestMapping("/placements")
public class PlacementaController {

	@Autowired
	private PlacementsRepository placementsRepo;
	
	@Autowired
	private PlacementTitleRepository placementTitlesRepo;
	
	@RequestMapping(name="/", method=RequestMethod.GET)
	public Response<Placement> getAll() {
		Response<Placement> response = new Response<Placement>();
		List<Placement> placements = (List<Placement>) placementsRepo.findAll(Sort.by("type", "englishName"));
		response.setSuccessful(true);
		response.setObjects(placements);
		return response;
	}

	@RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<Placement> getCreate(@RequestBody Placement placement) {
		Response<Placement> response = new Response<Placement>();
		placementsRepo.save(placement);
		response.addObject(placement);
		response.setSuccessful(true);
		return response;
	}
	
	@RequestMapping(value="/delete/{id}", method=RequestMethod.DELETE)
    public Response<Object> deletePeriod(@PathVariable(value="id") String id) {
    	Response<Object> response = new Response<Object>();
    	this.placementsRepo.deleteById(id);
    	response.setSuccessful(true);
    	return response;
    }

	@RequestMapping(value="/read/{id}", method=RequestMethod.GET)
    public Response<Object> readPlacement(@PathVariable(value="id") String id) {
    	Response<Object> response = new Response<Object>();
    	Placement placement = this.placementsRepo.findById(id).get();
    	response.setSuccessful(true);
    	response.addObject(placement);
    	return response;
    }

	@RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"})
    public Response<Object> updatePlacement(@RequestBody Placement placement) {
    	Response<Object> response = new Response<Object>();
    	this.placementsRepo.save(placement);
    	response.setSuccessful(true);
    	return response;
    }
	

	@RequestMapping(value="/update/{placementId}/title", method=RequestMethod.POST, consumes={"application/json"},  produces={"application/json"})
    public Response<Placement> updatePlacementTitle(@RequestBody PlacementTitle placementTitle, @PathVariable(value="placementId") String placementId) {
    	Response<Placement> response = new Response<Placement>();
    	Placement placement = this.placementsRepo.findById(placementId).get();
    	
    	if(placement == null) {
    		response.setSuccessful(false);
        	return response;
    	}
    	placementTitle.setPlacement(placement);
    	placement.getTitles().add(placementTitle);
    	placement = this.placementsRepo.save(placement);
    	response.setSuccessful(true);
    	response.setObject(placement);
    	return response;
    }
	
	@RequestMapping(value="/delete/{placementId}/title/{titleId}", method=RequestMethod.DELETE, consumes={"application/json"},  produces={"application/json"})
    public Response<Placement> deletePlacementTitle(@PathVariable(value="placementId") String placementId, @PathVariable(value="titleId") String titleId) {
    	Response<Placement> response = new Response<Placement>();
//    	this.placementTitlesRepo.deleteById(titleId);
//    	this.placementTitlesRepo.flush();
    	Placement placement = this.placementsRepo.findById(placementId).get();
    	
    	for(PlacementTitle title : placement.getTitles()) {
    		if(title.getGuid().equalsIgnoreCase(titleId)) {
    			placement.getTitles().remove(title);
    			break;
    		}
    	}
    	
    	placement = this.placementsRepo.save(placement);
    			
    	response.setSuccessful(true);
    	response.setObject(placement);
    	return response;
    }
}
