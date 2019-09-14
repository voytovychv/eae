sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"org/eae/tools/utils/FormatUtils"
], function(Controller, FormatUtils){
	return Controller.extend("org.eae.tools.controller.MyShifts", {
		formatUtils : FormatUtils,

		onInit : function(){
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("myShifts").attachPatternMatched(function(oEvent){
				var objectPage = this.getView().byId("myShiftsPage");
				var publisherId = oEvent.getParameter("arguments").publisherId;
				this.getView().getModel().fetchData("rest/shifts/approvedShifts/publisher/" + publisherId, "/PublisherData/MyShifts", true);
				objectPage.bindElement("/PublisherData/MyShifts/");
				sap.ui.core.BusyIndicator.hide();
			}.bind(this));
		},
		
		onNavBack : function(oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("landingPage");
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
	});
});