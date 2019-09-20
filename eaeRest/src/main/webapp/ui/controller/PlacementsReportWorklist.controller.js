sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat",
    "org/eae/tools/utils/FormatUtils",
    "sap/m/MessageBox"
], function(Controller, DateFormat, FormatUtils, MessageBox){
	return Controller.extend("org.eae.tools.controller.PlacementsReportWorklist", {
		formatUtils : FormatUtils,
		
		__fromDate: null,
		__toDate : null,
		__i18nModel: undefined,
		
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
			this.__i18nModel = this.getView().getModel("i18n");
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
			this.__guid = oEvent.getParameter("listItem").getBindingContext().getObject().guid;
			
			MessageBox.confirm(this.__i18nModel.getProperty("rowDeleteReportConfirmation"), {
				icon: MessageBox.Icon.QUESTION,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose : this.onConfirmDelete.bind(this)
			});

		},
		
		onConfirmDelete : function(sAction) {
			if(sAction === "YES") {
				var oModel = this.getView().getModel();
				oModel.removeById("rest/shiftReport/delete/"+this.__guid).then(function(oEvent) {
					this.refreshTable();
				}.bind(this)); 			
			}
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