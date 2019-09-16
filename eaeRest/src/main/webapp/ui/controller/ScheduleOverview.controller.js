sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"org/eae/tools/utils/FormatUtils"
], function(Controller, FormatUtils){
	return Controller.extend("org.eae.tools.controller.ScheduleOverview", {
		formatUtils : FormatUtils,
		onInit : function(){
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("overviewSchedule").attachPatternMatched(function(oEvent){
				var objectPage = this.getView().byId("overviewSchedule");
				var periodId = oEvent.getParameter("arguments").periodId;
				var scheduleId = oEvent.getParameter("arguments").scheduleId;
				this._sScheduleId = scheduleId;
				this.loadSericeDays(periodId);
				objectPage.bindElement("/Schedule/" + periodId);
			}.bind(this));
		},
		
		onNavBack : function(oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("scheduleWorklist");
		},
		
		loadSericeDays : function(periodId) {
			if(periodId === undefined) {
				periodId = this._sPeriod;
			} else {
				this._sPeriod = periodId;	
			}
			
			var oModel = this.getView().getModel();
			oModel.setProperty("/Schedule/" + periodId, {});
		    oModel.fetchData("rest/periods/period/" + periodId + "/schedule/" +this._sScheduleId + "/weeks" , "/Schedule/" + periodId + "/weeks", true, {}, true).
		    then(function(){
		    	oModel.read("rest/periods/read/" + periodId).then(function(data){
		    		oModel.setProperty("/Schedule/" + periodId + "/info", data);
		    		sap.ui.core.BusyIndicator.hide();
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
			if(!this._oPublisherActions) {
				this._oPublisherActions = sap.ui.xmlfragment("publisherAdminActions", "org.eae.tools.view.fragments.PublisherAdminActions", this);
				this.getView().addDependent(this._oPublisherActions);	
			}
			
			var oPubBc = oEvent.getSource().getBindingContext();
			var oShiftBc = oEvent.getSource().getParent().getBindingContext();
			
			this._AdminActins_Publisher = oPubBc.getModel().getObject(oPubBc.getPath()).guid;
			this._AdminActins_Shift = oShiftBc.getModel().getObject(oShiftBc.getPath()).guid;
			this._AdminAction_LineItemId = oEvent.getSource().getId();
			this._oPublisherActions.openBy(oEvent.getSource());
		},
		
		onBeforeAssignPublishersOpen : function(oEvent) {
			var oAssignedPublishers = sap.ui.getCore().byId("addPubToShift--assignedPublishers");
			oAssignedPublishers.removeSelections();
			var oAllPublishers = sap.ui.getCore().byId("addPubToShift--allPublishers");
			oAllPublishers.removeSelections();

			var oModel = this.getView().getModel();
			var oShiftBindingContext = oEvent.getSource().getBindingContext();
			var oShift = oShiftBindingContext.getModel().getObject(oShiftBindingContext.getPath());
			oModel.fetchData("rest/shifts/assignableToShift/" + oShift.guid, "/AssignedToShiftTemp", true, {}, true);
			oModel.fetchData("rest/publishers/", "/Publishers", true);
		},
		
		onAfterAssignPublishersClose : function(oEvent) {
			this.getView().getModel().setProperty("/AssignedToShiftTemp", []);
		},

		onAssignPublisher : function(oEvent) {
			var oModel = this.getView().getModel();
			var oPublisherItem = oEvent.getParameter("listItem");
			var oPublisherContext = oPublisherItem.getBindingContext();
			var oObj = oPublisherContext.getModel().getObject(oPublisherContext.getPath());
			var oCurrentShift = this._oCurrentShiftContext.getModel().getObject(this._oCurrentShiftContext.getPath());
			oModel.createObject("rest/shifts/assign/" + oCurrentShift.guid + "/schedule/" + this._sScheduleId + "/publisher/" + oObj.guid,
					{},
					"POST",
					this._oCurrentShiftContext.getPath(), false).then(function(){
						var oAssignedPublishers = sap.ui.getCore().byId("addPubToShift--assignedPublishers");
						oAssignedPublishers.removeSelections();
						
						this.getView().getModel().setProperty("/AssignedToShiftTemp", []);						
						oModel.fetchData("rest/shifts/assignableToShift/" + oCurrentShift.guid, "/AssignedToShiftTemp", true, {}, true);
					}.bind(this));
		},
		
		selectPublisherForAdd : function(oEvent) {
			var oShiftContext = oEvent.getSource().getBindingContext();
			this._oCurrentShiftContext = oShiftContext;
			if(!this._oAssignToShiftDialog) {
				this._oAssignToShiftDialog = sap.ui.xmlfragment("addPubToShift", "org.eae.tools.view.fragments.AddPublisherToShift", this);
				this.getView().addDependent(this._oAssignToShiftDialog);	
			}
			this._oAssignToShiftDialog.setBindingContext(oShiftContext);
			this._oAssignToShiftDialog.open();
		},
		
		onDeletePublisherFromShiftDelete : function(oEvent) {
			console.log(oEvent.getParameters());
			var oModel = this.getView().getModel();
			var oRemovedListItem = oEvent.getParameter("listItem");
			var oBindingContextP = oRemovedListItem.getBindingContext();
			var oBindingContextS = oEvent.getSource().getBindingContext();
			var oPublisherObj = oBindingContextP.getModel().getObject(oBindingContextP.getPath());
			var oShiftObj = oBindingContextS.getModel().getObject(oBindingContextS.getPath());
			var oShift = {
				shiftBinding : oBindingContextS,
			};
			
//			oModel.post("rest/shifts/unassign/" + oShiftObj.guid + "/schedule/" + this._sScheduleId + "/publisher/" + oPublisherObj.publisher.guid,
//					"POST",
//					"").then(function(aResults){
//						var oUpdatedShift = aResults.objects[0]; 
//						this.shiftBinding.getModel().setProperty(this.shiftBinding.getPath(), oUpdatedShift);
//						
//					}.bind(oShift));
			
			oModel.post("rest/shifts/unassign/assignment/" + oBindingContextP.getObject().guid,
			"POST",
			"").then(function(aResults){
				var oUpdatedShift = aResults.objects[0]; 
				this.shiftBinding.getModel().setProperty(this.shiftBinding.getPath(), oUpdatedShift);
				
			}.bind(oShift));
		},
		
		onCloseAssignPublishersPress : function (oEvent) {
			this._oAssignToShiftDialog.close();
		},
		
		
		onAssignAsLeader : function(oEvent) {
			var oModel = this.getView().getModel();
			oModel.post("rest/shifts/assignShiftLeader/" + this._AdminActins_Shift + "/assignment/" + this._AdminActins_Publisher,
					"POST"
					).then(function(){
						sap.ui.getCore().byId(this._AdminAction_LineItemId).setHighlight(sap.ui.core.MessageType.Success);
					}.bind(this));
	
		},
		
		onUnassignAsLeader : function(oEvent) {
			var oModel = this.getView().getModel();
			oModel.post("rest/shifts/unassignShiftLeader/" + this._AdminActins_Shift + "/assignment/" + this._AdminActins_Publisher,
					"POST"
					).then(function(){
						sap.ui.getCore().byId(this._AdminAction_LineItemId).setHighlight(sap.ui.core.MessageType.None);
					}.bind(this));
	
		},
		
		onAssignCarrier : function(oEvent) {
			var oModel = this.getView().getModel();
			oModel.post("rest/shifts/assignTrolleyCarrier/" + this._AdminActins_Shift + "/assignment/" + this._AdminActins_Publisher,
					"POST"
					).then(function(){
						sap.ui.getCore().byId(this._AdminAction_LineItemId).setInfo("#");
					}.bind(this));
	
		},
		
		onUnassignCarrier : function(oEvent) {
			var oModel = this.getView().getModel();
			oModel.post("rest/shifts/unassignTrolleyCarrier/" + this._AdminActins_Shift + "/assignment/" + this._AdminActins_Publisher,
					"POST"
					).then(function(){
						sap.ui.getCore().byId(this._AdminAction_LineItemId).setInfo("");
					}.bind(this));
	
		},
		
		onShiftPublisherPress : function(oEvent) {
			if(!this._oPublisherActions) {
				this._oPublisherActions = sap.ui.xmlfragment("publisherAdminActions", "org.eae.tools.view.fragments.PublisherAdminActions", this);
				this.getView().addDependent(this._oPublisherActions);	
			}
			var oPubBc = oEvent.getSource().getBindingContext();
			var oShiftBc = oEvent.getSource().getParent().getBindingContext();
			
			this._AdminActins_Publisher = oPubBc.getModel().getObject(oPubBc.getPath()).guid;
			this._AdminActins_Shift = oShiftBc.getModel().getObject(oShiftBc.getPath()).guid;
			this._AdminAction_LineItemId = oEvent.getSource().getId();
			this._oPublisherActions.openBy(oEvent.getSource());
		},
		onShareSchedule : function() {
			var oModel = this.getView().getModel();
			oModel.read("rest/cartSchedule/share/" + this._sScheduleId).then(function(data) {
	    		oModel.setProperty("/Schedule/" + this._sPeriod + "/cartSchedule", data);
			}.bind(this));
		},
		
		onUnshareSchedule : function() {
			var oModel = this.getView().getModel();
			oModel.read("rest/cartSchedule/unshare/" + this._sScheduleId).then(function(data) {
	    		oModel.setProperty("/Schedule/" + this._sPeriod + "/cartSchedule", data);
			}.bind(this));;
		},
		
		removeShift : function(oEvent) {
			var oModel = this.getView().getModel();
			var oShiftControl = oEvent.getSource();
			var oContext = oShiftControl.getBindingContext();
			var sGuid = oContext.getModel().getObject(oContext.getPath());
			oModel.removeById("rest/shifts/delete/" + sGuid).then(function(){
				this.loadSericeDays();
			}.bind(this));
		},
		
		onLocationTodeliverChange : function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oModel = this.getView().getModel();
			var oBC = oEvent.getSource().getBindingContext();
			var oDay = oBC.getModel().getObject(oBC.getPath());
			oModel.post("rest/shifts/deliverAfterDay/" + oDay.guid + "/schedule/" + this._sScheduleId + "/comment", "POST", sValue);
		},
		
		onSendInvites : function(oEvent) {
			var oModel = this.getView().getModel();
			var sShift = oEvent.getSource().getBindingContext().getProperty("guid");
			oModel.post("rest/cartSchedule/sendShiftInvite/shift/" + sShift + "/schedule/" + this._sScheduleId).then(function(){
				console.log("sent");
			}).catch(function(){
				console.log("error");
			});
		},
		
		onAllPublisherSearch : function(oEvt) {
			var oAssignedPublishers = sap.ui.getCore().byId("addPubToShift--allPublishers");
			var oListBinding = oAssignedPublishers.getBinding("items");
			
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			
			if (sQuery && sQuery.length > 0) {
				var surnameFilter = new sap.ui.model.Filter("surname", sap.ui.model.FilterOperator.Contains, sQuery);
				var nameFilter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(nameFilter);
				aFilters.push(surnameFilter);
			}
			var oOrFilter = new sap.ui.model.Filter({
				filters : aFilters,
				and: false
			})
			oListBinding.filter(aFilters.length == 0 ? [] : oOrFilter, "Application");
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
		onSendInvitesForWeek : function(oEvent) {
//			var oModel = this.getView().getModel();
//			var week = ["1", "2"];
//			var request = {
//					shifts: {
//					day:"1",
//					day2:"2"
//					}
//			};
//			
//			oModel.post("rest/cartSchedule/sendShiftInvites/schedule/" + this._sScheduleId, "POST", request).then(function(){
//				console.log("sent");
//			}).catch(function(){
//				console.log("error");
//			});
//			console.log("onSendInvitesForWeek");
		}  
	});
});