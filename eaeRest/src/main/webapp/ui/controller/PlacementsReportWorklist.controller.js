sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat",
    "org/eae/tools/utils/FormatUtils"
], function(Controller, DateFormat, FormatUtils){
	return Controller.extend("org.eae.tools.controller.PlacementsReportWorklist", {
		formatUtils : FormatUtils,
		
		__fromDate: null,
		__toDate : null,
		
		onInit : function(){
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("placementsReport").attachPatternMatched(function(){
				this.refreshTable();
			}.bind(this));
			
			var oDateRange = this.getView().byId("dateRange");
			var oMonthAgoDate = new Date();
			oMonthAgoDate.setDate(oMonthAgoDate.getDate() - 14);
			oDateRange.setDateValue(oMonthAgoDate);
			var toDate = new Date();
			toDate.setDate(toDate.getDate() + 1);	
			oDateRange.setSecondDateValue(toDate);
		},
		
		refreshTable : function() {
			var oDateRange = this.getView().byId("dateRange");
			var oDateRange = {
					"starts" : oDateRange.getDateValue().getTime(),
					"ends" : oDateRange.getSecondDateValue().getTime()
			}
			var oModel = this.getView().getModel();
			oModel.post("rest/shiftReport/", "GET", oDateRange).then(function(oData) {
				oModel.setProperty("/ShiftReports", oData.objects);
				sap.ui.core.BusyIndicator.hide();
			}.bind(this));
			


		},
		
		onNavBack : function(oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("landingPage");
		},
		
		handleDeleteShiftReport : function (oEvent) {
			var oModel = this.getView().getModel();
			var guid = oEvent.getParameter("listItem").getBindingContext().getObject().guid;
			oModel.removeById("rest/shiftReport/delete/"+guid).then(function(oEvent) {
				this.refreshTable();
			}.bind(this)); 
		},
		
		onFilter : function(oEvent) {
			
			this.refreshTable();
			
		},
		handleUpdateBinding : function(eEvent) {
			console.log("handleUpdateBinding");
		},
		
		onNavigateToReportDetails : function(oEvent) {
			var itemObject = oEvent.getParameter("listItem").getBindingContext().getObject();
			this.getOwnerComponent().getRouter().navTo("shiftReportById", {
				reportId : itemObject.guid
			});
		}
	});
});