package com.eae.schedule.ui.model.report;

import java.io.Serializable;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.eae.schedule.model.Constants;
import com.eae.schedule.model.Placement;
import com.eae.schedule.model.PlacementTitle;
import com.eae.schedule.model.PublicationLanguage;
import com.eae.schedule.model.ShiftReport;
import com.eae.schedule.model.ShiftReportItem;

public class ReportDTO implements Serializable {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private ShiftReport report;
	private String reportGuid;
	private int videosCount;
	private int placementsCount;
	private BaseDTO root;
	private String lang;
	
	public ReportDTO(ShiftReport report, List<Placement> allPlacements, List<PublicationLanguage> languages, String lang) {
		this.report = report;
		this.reportGuid = this.report.getGuid();
		this.root = new BaseDTO(); 
		this.lang = lang;

    	Set<String> types = new HashSet<>();
    	
    	for(Placement pl : allPlacements) {
    		types.add(pl.getType());
    	}
		
		languages.forEach((language) -> {
			String nodeLang = language.getGuid();
			BaseDTO langChild = new  BaseDTO();
			langChild.setDisplayCode(language.getOriginaLangName());
			langChild.setType(Constants.LANG);
			
			for(String type : types) {
				buildLeafStructure(langChild, allPlacements, nodeLang, type);
			}
			
			root.addChild(langChild);
		});		
		
	}


	private void buildLeafStructure(BaseDTO parent, List<Placement> allPlacements, String langGuid, String type) {
		BaseDTO branch = new BaseDTO();
		branch.setDisplayCode(type);
		branch.setType(type);
		parent.addChild(branch);

		allPlacements.forEach((placement) -> {
			if(placement.getType() != null 
					&& placement.getType().equalsIgnoreCase(type) 
					&& langGuid.equalsIgnoreCase(placement.getLanguage().getGuid()) ) {
				BaseDTO leaf = new BaseDTO();
				leaf.setGuid(placement.getGuid());
				List<PlacementTitle> titles = placement.getTitles();
				String display = placement.getEnglishName();
				if(this.lang != null) {
					for(PlacementTitle title : titles) {
						if(title.getLanguage().getIsoCode().equalsIgnoreCase(this.lang)) {
							display = title.getTitle();
						}
					}
				}
				
				leaf.setDisplayCode(display);
				leaf.setType(placement.getType());
				
				Integer count = this.getCountOfPlacements(placement);
				
				if(placement.getType().equalsIgnoreCase(Constants.PUBLICATION_TYPE_VIDEO) && count != null ) {
					this.videosCount += count;
				} else if( count != null){
					this.placementsCount += count;
				}
				
				leaf.setCount(count);
				branch.addChild(leaf);
			}
		});
	}

	private int getCountOfPlacements(Placement placememt) {
		List<ShiftReportItem> items = this.report.getItems();
		
		for(ShiftReportItem reportItem : items) {
			if(reportItem.getPlacement().getGuid().equalsIgnoreCase(placememt.getGuid())) {
				return reportItem.getCount();
			}
		}
		
		return 0;
	}
	
	
	public String getReportGuid() {
		return reportGuid;
	}


	public void setReport(ShiftReport report) {
		this.reportGuid = report.getGuid();
		this.report = report;
	}

	public BaseDTO getRoot() {
		return root;
	}


	public void setRoot(BaseDTO root) {
		this.root = root;
	}


	public int getVideosCount() {
		return videosCount;
	}


	public void setVideosCount(int videoCount) {
		this.videosCount = videoCount;
	}


	public int getPlacementsCount() {
		return placementsCount;
	}


	public void setPlacementsCount(int placementsCount) {
		this.placementsCount = placementsCount;
	}
}
