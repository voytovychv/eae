sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Link",
    "sap/ui/core/routing/History"
], function(Controller, Link, History){
	return Controller.extend("org.eae.tools.controller.ShiftReport", {

		__currentPath:"",
		__currentName : "",
		
		__shiftId : "",
		__scheduleId : "",
		
		__all_langs : "All Languages",
		
		__count : -1,
		
		onInit : function(){
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("shiftReport").attachPatternMatched(function(oEvent){
				this.__shiftId = oEvent.getParameter("arguments").shiftId;
				this.__scheduleId = oEvent.getParameter("arguments").scheduleId;
				this.__currentName = this.__all_langs;
				this.refreshTable(this.__scheduleId, this.__shiftId);
				this.__currentPath = "/ShiftReport/schedule/" + this.__scheduleId + "/shift/" + this.__shiftId + "/0/root";
			}.bind(this));

		},
		
		onNavBack : function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("landingPage", true);
			}
		},
		
		
		refreshTable : function(scheduleId, shiftId) {
			var lang = sap.ui.getCore().getConfiguration().getLanguage().split("-")[0];
			this.getView().getModel().fetchData("rest/shiftReport/report/" + scheduleId + "/" + shiftId, 
					"/ShiftReport/schedule/" + scheduleId + "/shift/" + shiftId, true, {"lang" : lang});
			
			var sRootPath = "/ShiftReport/schedule/" + scheduleId + "/shift/" + shiftId + "/0/root";
			this.getView().byId("idShiftReportTable").bindElement(sRootPath);
			var breadCrumb = this.getView().byId("navBreadCrumb");
			breadCrumb.setCurrentLocationText(this.__currentName);
			if(breadCrumb.getLinks().length > 0) {
				breadCrumb.removeAllLinks();
			}
			sap.ui.core.BusyIndicator.hide();
		},
		selectPublicationItem : function (oEvent) {
			var li = oEvent.getParameter("srcControl");
			var table = li.getParent();
			var oBC = li.getBindingContext();
			var liObject = oBC.getObject();
			var bActionsVisible = liObject.guid !== null;
			var breadCrumb = this.getView().byId("navBreadCrumb");
			
			if(bActionsVisible) {
				this.onEditCount(oBC)
				return;
			}
			
			var sPath = oBC.getPath();
			if(this.__currentPath === sPath) {
				return;
			}
			
			table.bindElement(sPath);

			breadCrumb.setCurrentLocationText(liObject.displayCode);
			var oLink = new Link({
				press: this.onBreadCrumbLinkPress.bind(this),
				text: this.__currentName
			});
			oLink.data("path", this.__currentPath);
			oLink.data("name", this.__currentName);
			breadCrumb.addLink(oLink);
			
			this.__currentPath = sPath;
			this.__currentName = liObject.displayCode;
			sap.ui.core.BusyIndicator.show(1);
			this.delayedBusyOff();
		},
		
		delayedBusyOff : function() {
//			sap.ui.core.BusyIndicator.hide();
			setTimeout(function() { 
				sap.ui.core.BusyIndicator.hide();
				}, 200);
		},
		
		onEditCount : function(oBindingContext) {
			if(!this._oModufyReportItemDialog) {
				this._oModufyReportItemDialog = sap.ui.xmlfragment("modifyReportItem", "org.eae.tools.view.fragments.ModifyReportItemCount", this);
				this.getView().addDependent(this._oModufyReportItemDialog);	
			}
			this._oModufyReportItemDialog.setBindingContext(oBindingContext);
			this._oModufyReportItemDialog.open();
			
		},
		
		onBreadCrumbLinkPress : function (oEvent) {
			console.log("onBreadCrumbLinkPress");
			var table = this.getView().byId("idShiftReportTable");
			var oBreadCrumbLink = oEvent.getSource();
			var oBreadCrumbs = this.getView().byId("navBreadCrumb");
			var index = oBreadCrumbs.indexOfLink(oBreadCrumbLink);
			var length = oBreadCrumbs.getLinks().length;
			for(var i = length; i >= index; i--) {
				oBreadCrumbs.removeLink(i);
			}
			table.bindElement(oBreadCrumbLink.data("path"));
			oBreadCrumbs.setCurrentLocationText(oBreadCrumbLink.data("name"));
			
			if(index == 0) {
				this.__currentName=this.__all_langs;
				this.__currentPath = "/ShiftReport/schedule/" + this.__scheduleId + "/shift/" + this.__shiftId + "/0/root";
			} else {
				this.__currentName=oBreadCrumbLink.data("name");
				this.__currentPath = oBreadCrumbLink.data("path");
				
			}
			
			sap.ui.core.BusyIndicator.show(1);
			this.delayedBusyOff();
		},
		
		onBeforeOpenReportItem : function(oEvent) {
			var oBC = oEvent.oSource.getBindingContext();
			var currentCount = oBC.getObject().count;
			if(this.__count === -1) {
				this.__count = currentCount;
			}
		},
		
		onConfirmReportItemModify : function(oEvent) {
			var oModel = this.getView().getModel();
			var oBC = oEvent.oSource.getBindingContext();
			var currentCount = oBC.getObject().count;
			var guid = oBC.getObject().guid;
			console.log("onConfirmReportItemModify " + currentCount);
			this.__count = -1;
			
			oModel.post("rest/shiftReport/report/"+ this.__scheduleId + "/" + this.__shiftId + "/placenent/" +guid+ "/count/" + currentCount, "POST", {})
			.then(function(resp) {
				console.log("POST of count done");
			}.bind(this)).catch(function(error){
				console.log("POST of count failed");
			});
			
			this._oModufyReportItemDialog.close();
		},
		
		onCancelReportItemModify : function(oEvent) {
			var oBC = oEvent.oSource.getBindingContext();
			var currentCount = oBC.getObject().count;

			console.log("onCancelReportItemModify " + currentCount);
			this.__count = -1;
			this._oModufyReportItemDialog.close();
		},
		
		onAfterCloseReportItem : function(oEvent) {
			if(this.__count === -1) {
				return;
			}
			var oBC = oEvent.oSource.getBindingContext();
			var sPath = oBC.getPath();
			var oldCount = this.__count; 
			oBC.getModel().setProperty(sPath + "/count", this.__count);
			
			this.__count = -1;
		}
	});
});