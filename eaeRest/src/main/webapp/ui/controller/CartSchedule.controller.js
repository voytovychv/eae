sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"org/eae/tools/utils/FormatUtils"
], function(Controller, FormatUtils){
	return Controller.extend("org.eae.tools.controller.CartSchedule", {
		formatUtils : FormatUtils,

		onAfterRendering : function() {
			
			
		},
		
		onInit : function(){
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("cartSchedule").attachPatternMatched(function(oEvent){
				var objectPage = this.getView().byId("cartSchedule");
				var periodId = oEvent.getParameter("arguments").periodId;
				var scheduleId = oEvent.getParameter("arguments").scheduleId;
				this._sScheduleId = scheduleId;
				this._sPeriodId = periodId;
				this.loadSericeDays(periodId);
				objectPage.bindElement("/Schedule/" + periodId);
			}.bind(this));
		},
		
		onNavBack : function(oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("landingPage");
		},
		
		loadSericeDays : function(periodId) {
			if(periodId === undefined) {
				periodId = this._sPeriod;
			} else {
				this._sPeriod = periodId;	
			}
			
			var oModel = this.getView().getModel();
			oModel.setProperty("/Schedule/" + periodId, {});
			oModel.fetchData("rest/periods/period/" + periodId + "/schedule/" +this._sScheduleId + "/weeksToServe" , "/Schedule/" + periodId + "/weeks", true, {}, true).
		    then(function(){
		    	oModel.read("rest/periods/read/" + periodId).then(function(data){
		    		oModel.setProperty("/Schedule/" + periodId + "/info", data);
		    	});
		    	
		    	oModel.read("rest/cartSchedule/read/" + this._sScheduleId).then(function(data){
		    		oModel.setProperty("/Schedule/" + periodId + "/cartSchedule", data);
		    		sap.ui.core.BusyIndicator.hide();
		    	})
		    }.bind(this));
		},
		
		formatHeaderTitle : function(obj) {
			if(obj) {
				return FormatUtils.formatPeriodDates(obj.starts, obj.ends);	
			}
			return "";
		},

		formatShiftAssignmentVisibility : function(oSchedule) {
			if(!oSchedule) {
				return false;
			} 
			
			if(oSchedule.guid === this._sScheduleId) {
				return true;
			}
			
			return false;
		},

		onShiftPublisherPress : function(oEvent) {
			var oSource = oEvent.getSource();
			console.log("onShiftPublisherPress");
			
			if(!this._oUserActionsDialog) {
				this._oUserActionsDialog = sap.ui.xmlfragment("useActions", "org.eae.tools.view.fragments.ScheduleContactActions", this);
				this.getView().addDependent(this._oUserActionsDialog);	
			}
			
			this._oUserActionsDialog.setBindingContext(oSource.getBindingContext());
			
			this._oUserActionsDialog.openBy(oSource);
		},
		
		onCallPhone : function(oEvent) {
			var oSource = oEvent.getSource();
			var phoneNumber = oSource.data("phone");
			sap.m.URLHelper.triggerTel(phoneNumber);
		},
		
		onWhatsup : function(oEvent) {
			var oSource = oEvent.getSource();
			var phoneNumber = oSource.data("phone");
			sap.m.URLHelper.redirect("https://api.whatsapp.com/send?phone=" + phoneNumber);
			
		},
		
		onDownloadPdfSchedule : function(oEvent) {
			var oModel = this.getView().getModel();
			sap.m.URLHelper.redirect("rest/cartSchedule/downloadPdf/period/" + this._sPeriodId + "/schedule/" + this._sScheduleId);
			
		},
		
		formatCommentVisibility : function(sText) {
			return !!sText;
		},
		
		navigateToShiftReport : function(oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oShift = oBindingContext.getObject();
			oRouter.navTo("shiftReport", {
				shiftId : oShift.guid,
				scheduleId : this._sScheduleId
				
			});
		},
		navigateToShiftReportCard : function(oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oShift = oBindingContext.getObject();
			oRouter.navTo("shiftReportCart", {
				shiftId : oShift.guid,
				scheduleId : this._sScheduleId
				
			});
		}
	});
});