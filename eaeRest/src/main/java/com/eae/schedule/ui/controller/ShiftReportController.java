package com.eae.schedule.ui.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eae.schedule.model.CartPoint;
import com.eae.schedule.model.CartSchedule;
import com.eae.schedule.model.Constants;
import com.eae.schedule.model.Placement;
import com.eae.schedule.model.PublicationLanguage;
import com.eae.schedule.model.Shift;
import com.eae.schedule.model.ShiftReport;
import com.eae.schedule.model.ShiftReportItem;
import com.eae.schedule.repo.CartScheduleRepository;
import com.eae.schedule.repo.PlacementsRepository;
import com.eae.schedule.repo.PublicationLangsRepository;
import com.eae.schedule.repo.ShiftReportItemRepository;
import com.eae.schedule.repo.ShiftReportPageableRepository;
import com.eae.schedule.repo.ShiftReportRepository;
import com.eae.schedule.repo.ShiftRepository;
import com.eae.schedule.ui.model.Response;
import com.eae.schedule.ui.model.ShiftReportDTO;
import com.eae.schedule.ui.model.report.ReportDTO;

@RestController
@RequestMapping("/shiftReport")
public class ShiftReportController {

	@Autowired
	private ShiftReportRepository shiftReportRepo;
	
	@Autowired
	private ShiftRepository shiftRepo;
	
	@Autowired
	private PlacementsRepository placementsRepo;
	
	@Autowired
	private CartScheduleRepository cartScheduleRepo;
	
	@Autowired
	private ShiftReportItemRepository reporItem;

	@Autowired
	private PublicationLangsRepository langRepo;
	
	@Autowired
	private ShiftReportPageableRepository pageableShiftRepo;
	
	@RequestMapping(name="/", method=RequestMethod.GET)
	public Response<ShiftReportDTO> getAll(@RequestParam(name="page", required=false, defaultValue="0") int page) {
		Response<ShiftReportDTO> response = new Response<ShiftReportDTO>();
		PageRequest pageRequest = PageRequest.of(0, 20);
		Page<ShiftReport> placements = pageableShiftRepo.findAll(pageRequest);
		response.setTotal( pageableShiftRepo.count() );
		response.setSuccessful(true);
		List<ShiftReport> reports = placements.getContent();
		
		for(ShiftReport report : reports) {
			ShiftReportDTO dto = new ShiftReportDTO();
			dto.setTrolley(report.getCart().getName());
			dto.setFrom(report.getStarts());
			dto.setTo(report.getEnds());
			dto.setGuid(report.getGuid());
			Integer videoCount = 0;
			Integer placementCount = 0;
			
			List<ShiftReportItem> items = report.getItems();
			
			for(ShiftReportItem item : items) {
				String category = item.getPlacement().getType();
				if(category.equalsIgnoreCase(Constants.PUBLICATION_TYPE_VIDEO)) {
					videoCount += item.getCount();
				} else {
					placementCount += item.getCount();
				}
			}
			
			dto.setVideosCount(videoCount);
			dto.setPlacementsCount(placementCount);
			
			response.getObjects().add(dto);
		}
		
		return response;
	}

	@RequestMapping(value="/report/{reportId}/placenent/{placementId}/count/{count}", method=RequestMethod.POST)
	public Response<Object> addPlacement(@PathVariable(value="reportId") String reportId,
										@PathVariable(value="placementId") String placementId, @PathVariable(value="count") String count) {
		
		Response<Object> response = new Response<Object>();
    	ShiftReport report = shiftReportRepo.findById(reportId).get();
    	ShiftReportItem item = report.findReportItem(placementId);
    	
    	if(item != null) {
        	item.setCount(Integer.parseInt(count));
    		this.reporItem.saveAndFlush(item);
    	} else {
    		item = new ShiftReportItem();
    		item.setPlacement(new Placement(placementId));
        	item.setCount(Integer.parseInt(count));
        	item.setReport(report);
        	report.getItems().add(item);
        	this.shiftReportRepo.saveAndFlush(report);
    	}
    	
    	response.setSuccessful(true);
    	return response;		
	}
	
	@RequestMapping(value="/delete/{reportId}", method=RequestMethod.DELETE)
    public Response<Object> deletePeriod(@PathVariable(value="reportId") String reportId) {
		Response<Object> response = new Response<Object>();
    	this.shiftReportRepo.deleteById(reportId);
    	response.setSuccessful(true);
    	return response;
    }
	
	@RequestMapping(value="/report/{scheduleId}/{shiftId}", method=RequestMethod.GET)
	public Response<ReportDTO> getCurrentStatusReportDTO(@PathVariable(value="scheduleId") String scheduleId, 
														 @PathVariable(value="shiftId") String shiftId,
														 @RequestParam(value = "lang", required = false) String lang
			) {
	
    	List<Placement> allPlacements = this.placementsRepo.findAll();
    	List<PublicationLanguage> allLanguages = this.langRepo.findAll();
    	
    	CartSchedule schedule = this.cartScheduleRepo.findById(scheduleId).get();

    	Shift shift = this.shiftRepo.findById(shiftId).get();
    	
    	ShiftReport report = null;
    	
    	List<ShiftReport> reportList = this.shiftReportRepo.findByShiftAndSchedule(new Shift(shiftId), new CartSchedule(scheduleId));
    	if(reportList != null && reportList.size() == 0) {
        	CartPoint cart = schedule.getCart();
    		report = new ShiftReport();
			report.setSchedule(schedule);
			report.setShift(shift);
			report.setCart(cart);
			report = shiftReportRepo.saveAndFlush(report);	
    	} else {
    		report = reportList.get(0);
    	}

		ReportDTO reportDto = new ReportDTO(report, allPlacements, allLanguages, lang);
		Response<ReportDTO> response = new Response<ReportDTO>();
		response.setObject(reportDto);
    	response.setSuccessful(true);
    	return response;
	}
	
	
}
