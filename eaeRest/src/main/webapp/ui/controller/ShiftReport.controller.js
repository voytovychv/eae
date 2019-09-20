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
		__reportId : "",
		
		__all_langs : "All",
		
		__count : -1,
		
		__i18nModel: undefined,
		
		__showEmptyRows: true,
		
		_initi18nModels : function() {
			this.__i18nModel = this.getView().getModel("i18n");
			this.__all_langs = this.__i18nModel.getProperty("allLanguages");
			this.__lang = sap.ui.getCore().getConfiguration().getLanguage().split("-")[0];	
			this.__currentName = this.__all_langs;
		},
		
		_initTableView : function(isRoot) {
			this.getView().byId("placementsCountColumn").setVisible(isRoot);
			this.getView().byId("videosCountColumn").setVisible(isRoot);
			this.getView().byId("countColumn").setVisible(!isRoot);			
		},
		
		onInit : function(){
			
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("shiftReport").attachPatternMatched(function(oEvent){
				this.__showEmptyRows = true;
				this._initi18nModels();
				this.__shiftId = oEvent.getParameter("arguments").shiftId;
				this.__scheduleId = oEvent.getParameter("arguments").scheduleId;
				this.__currentPath = "/ShiftReport/schedule/" + this.__scheduleId + "/shift/" + this.__shiftId;
				
				var oModel = this.getView().getModel();
				oModel.post("rest/shiftReport/report/" + this.__scheduleId + "/" + this.__shiftId, "GET", {"lang" : this.__lang}).then(
					function(data) {
						this.__reportId = data.object.reportGuid;
						oModel.createPath(this.__currentPath);
						oModel.setProperty(this.__currentPath, data.object);
						sap.ui.core.BusyIndicator.hide();
					}.bind(this)
				);
				
				var sRootPath = this.__currentPath + "/root";
				this.getView().byId("idShiftReportTable").bindElement(sRootPath);
				var breadCrumb = this.getView().byId("navBreadCrumb");
				breadCrumb.setCurrentLocationText(this.__currentName);
				if(breadCrumb.getLinks().length > 0) {
					breadCrumb.removeAllLinks();
				}
				sap.ui.core.BusyIndicator.hide();
				
				
				this.getView().byId("overviewBox").bindElement(this.__currentPath);
				this._initTableView(true);
				
			}.bind(this));

			oRouter.getRoute("shiftReportById").attachPatternMatched(function(oEvent){
				this.__showEmptyRows = false;
				this._initi18nModels();
				this.__reportId = oEvent.getParameter("arguments").reportId;
				sap.ui.core.BusyIndicator.show();
				var oModel = this.getView().getModel();
				oModel.post("rest/shiftReport/report/id/" + this.__reportId, "GET", {"lang" : this.__lang}).then(
					function(data) {
						this.__reportId = data.object.reportGuid;
						this.__scheduleId = data.object.scheduleId;
						this.__shiftId = data.object.shiftId;
						this.__currentPath = "/ShiftReport/schedule/" + this.__scheduleId + "/shift/" + this.__shiftId;
						
						oModel.createPath(this.__currentPath);
						oModel.setProperty(this.__currentPath, data.object);

						this.getView().byId("idShiftReportTable").bindElement(this.__currentPath + "/root");
						
						var breadCrumb = this.getView().byId("navBreadCrumb");
						breadCrumb.setCurrentLocationText(this.__currentName);
						
						this.getView().byId("overviewBox").bindElement(this.__currentPath);
						this._initTableView(true);
						
						sap.ui.core.BusyIndicator.hide();
					}.bind(this)
				);

//				this.__shiftId = oEvent.getParameter("arguments").shiftId;
//				this.__scheduleId = oEvent.getParameter("arguments").scheduleId;
//				this.__currentName = this.__all_langs;
//				this.refreshTable();
//				this.__currentPath = "/ShiftReport/schedule/" + this.__scheduleId + "/shift/" + this.__shiftId + "/root";
//				
//				this.getView().byId("overviewBox").bindElement("/ShiftReport/schedule/" + this.__scheduleId + "/shift/" + this.__shiftId);
				
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
		
		
		refreshTable : function() {

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

			breadCrumb.setCurrentLocationText(this.formatDisplayCode(liObject.displayCode));
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
			
			this.getView().byId("shiftReport").setShowFooter(true);
			this._setNameOfBackTo();
			
			this.getView().byId("typeColumn").setVisible(true);
			this._initTableView(false);
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
				this._oModufyReportItemDialog.attachBeforeOpen(this.beforeModifyReportEvent.bind(this));
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
			table.bindElement(oBreadCrumbLink.data("path") + "/root");
			oBreadCrumbs.setCurrentLocationText(oBreadCrumbLink.data("name"));
			
			if(index == 0) {
				this.__currentName=this.__all_langs;
				this.__currentPath = "/ShiftReport/schedule/" + this.__scheduleId + "/shift/" + this.__shiftId;
			} else {
				this.__currentName=oBreadCrumbLink.data("name");
				this.__currentPath = oBreadCrumbLink.data("path");
				
			}
			
			sap.ui.core.BusyIndicator.show(1);
			this.delayedBusyOff();
			
			this._setNameOfBackTo();
			this._initTableView(true);
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
			oModel.post("rest/shiftReport/report/" + this.__reportId+ "/placenent/" + guid + "/count/" + currentCount, "POST", {})
			.then(function(resp) {
				oModel.setProperty(oBC.getPath() + "/calculatedCount", currentCount);
				
				var path = "/ShiftReport/schedule/" + this.__scheduleId + "/shift/" + this.__shiftId;
				
				if(this.__currentType === "VIDEO") {
					var videosCount = oModel.getProperty(path + "/videosCount");
					var diff = currentCount - this.__beforeCount;
					videosCount += diff;
					oModel.setProperty(path + "/videosCount", videosCount)
				} else {
					var placememtsCount = oModel.getProperty(path + "/placementsCount");
					var diff = currentCount - this.__beforeCount;
					placememtsCount += diff;
					oModel.setProperty(path + "/placementsCount", placememtsCount)
				}
				
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
		},
		
		calcutateReportItem : function(sId, oContext) {
			var oUIControl = this.byId("reportItem").clone(sId);
			var oTreeObject = oContext.getObject();
//			oTreeObject.calculatedCount = this.calculateChildren(oTreeObject);
			oTreeObject.calculatedVideosCount = this.calculateChildren(oTreeObject, "VIDEO");
			oTreeObject.calculatedPlacementsCount = this.calculateChildren(oTreeObject, "PLACEMENT");
			oTreeObject.calculatedCount = oTreeObject.calculatedVideosCount + oTreeObject.calculatedPlacementsCount;
			oTreeObject.calculatedCount = this.calculateChildren(oTreeObject);
			if(oTreeObject.calculatedCount == 0 && !this.__showEmptyRows) {
				return oUIControl.setVisible(false);		
			}
			return oUIControl;
		},
		
		calculateChildren : function (oTree, type) {
			var count = 0;
			var aChildren = oTree['children'];
			if(aChildren != undefined) {
				for(var i=0; i< aChildren.length; i++) {
					var aNextChildren = aChildren[i];
					if(aNextChildren != undefined) {
						var childCount = this.calculateChildren(aNextChildren, type);
						count += childCount;
					}
				}				
			}

			if(oTree.type == type) {
				var currentCount = oTree.count;
				if(currentCount != undefined){
					count += currentCount;	
				}
			} else if(( oTree.type === "BROCHURE" || oTree.type === "TRACT" || oTree.type === "BOOK" ) && type === "PLACEMENT") {
				var currentCount = oTree.count;
				if(currentCount != undefined){
					count += currentCount;	
				}
			} else if(type === undefined) {
				var currentCount = oTree.count;
				if(currentCount != undefined){
					count += currentCount;	
				}
			}
			return count;
			
		},
		
		beforeModifyReportEvent : function(oEvent) {
			var oModel = this.getView().getModel();
			var oBC = oEvent.oSource.getBindingContext();
			var oCurrentObject = oBC.getObject();
			var currentCount = oCurrentObject.count;
			var currentType = oCurrentObject.type;
			this.__beforeCount = currentCount;
			this.__currentType = currentType;
			console.log(this.__currentType);
			console.log(this.__beforeCount);
		},
		
		formatDisplayCode : function(sText) {
			var value = "";
			
			switch(sText)  {
				case("TRACT"):
					value = this.__i18nModel.getProperty("tract");
					break;

				case("VIDEO"):
					value = this.__i18nModel.getProperty("video");
					break;
				
				case("BROCHURE"):
					value = this.__i18nModel.getProperty("brochure");
					break;

				case("BOOK"):
					value = this.__i18nModel.getProperty("book");
					break;
					
				
				default:
					value = sText;
					break;
			}
			return value;
		},
		
		onDone : function (oEvent) {
			var oBreadCrumbs = this.getView().byId("navBreadCrumb");
			var oLink = oBreadCrumbs.getLinks()[0];
			oLink.firePress();
			this.getView().byId("shiftReport").setShowFooter(false);
		},
		
		onBackTo : function (oEvent) {
			var oBreadCrumbs = this.getView().byId("navBreadCrumb");
			var aLinks = oBreadCrumbs.getLinks();
			var iPosToNav = aLinks.length -1;
			var oLink = aLinks[iPosToNav];
			oLink.firePress();
			
			if(iPosToNav === 0) {
				this.getView().byId("shiftReport").setShowFooter(false);	
			}
			
			this._setNameOfBackTo();
		},

		_setNameOfBackTo: function() {
			var oBreadCrumbs = this.getView().byId("navBreadCrumb");
			var aLinks = oBreadCrumbs.getLinks();
			
			if(aLinks.length === 0) {
				this.getView().byId("shiftReport").setShowFooter(false);
				this.getView().byId("typeColumn").setVisible(false);

				return;
			}
			
			var iPosToNav = aLinks.length -1;
			var oLink = aLinks[iPosToNav];

		},
		formatVisibleType : function(sType) {
			return "LANG" !== sType; 
		}
	});
});