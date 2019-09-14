sap.ui.define([
     "sap/ui/core/mvc/Controller",
     "sap/ui/core/format/DateFormat"
], function(Controller,DateFormat){
	"use strict";
	return Controller.extend("org.eae.tools.controller.Landing", {
		onInit : function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("landingPage").attachPatternMatched(function(oEvent){
				sap.ui.core.BusyIndicator.show(1000);
				this.getOwnerComponent().readCurrentUserInfo();
			}.bind(this));
		},
		
		navigateToTeamCalendar : function() {
			var oRouter = this.getOwnerComponent().getRouter();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("overviewPeriods");
		},
		
		navigateToPublisherManagement : function() {
			var oRouter = this.getOwnerComponent().getRouter();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("overviewPublishers");
		},
		
		navigateToPersonalCalendarManagement : function() {
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("publisherCalendar", {
					periodId : oModel.getProperty("/PublisherData/Period/guid"),
					publisherId : oModel.getProperty("/PublisherData/Publisher/guid")
			});
		},
		
		navigateToCuurentSchedule : function(oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			var sPeriodGuid = oEvent.getSource().data("period");
			var sScheduleGuid = oEvent.getSource().data("schedule");
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("cartSchedule", {				
					scheduleId : sScheduleGuid,
					periodId : sPeriodGuid});			
		},
		
		formatPeriodDates : function(starts, ends) {
			var oDateFormat = DateFormat.getDateInstance({
			    pattern: "MMM d"
			});


			return oDateFormat.format(new Date(starts)) + " - " + oDateFormat.format(new Date(ends));
		},
		
		manageCartPlaces : function() {
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("cartPlaceWorklist");	
		},
		
		navigateToScheduleManage : function(){
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("scheduleWorklist");	
		},
		
		navigateToMyShifts : function() {
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("myShifts", {
				publisherId : oModel.getProperty("/PublisherData/Publisher/guid")
			});	
		},
		
		navigateToMyCarts : function() {
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("myShifts", {
				publisherId : oModel.getProperty("/PublisherData/Publisher/guid")
			});	
		},
		
		naviagateToPublicationLanguagesManage : function() {
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("publicationLangs", {});	
		},
		
		navigateToPlacementTypesManage : function() {
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("placements", {});	
		},
		navigateToPlacementsReport : function(){
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("placementsReport", {});
		},
		
		navigateToShiftsReport : function() {
			var oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getView().getModel();
			sap.ui.core.BusyIndicator.show(1000);
			oRouter.navTo("placementsReport", {});
		}

	});
});