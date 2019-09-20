sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat"
], function(Controller, DateFormat){
	return Controller.extend("org.eae.tools.controller.PlacementsWorklist", {
		__i18nModel: undefined,
		onInit : function(){
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("placements").attachPatternMatched(function(){
				this.refreshTable();
			}.bind(this));
		},
		
		onNavBack : function(oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("landingPage");
		},
		
		refreshTable : function() {
			this.__i18nModel = this.getView().getModel("i18n");
			this.getView().getModel().fetchData("rest/placements", "/Placements", true);
			sap.ui.core.BusyIndicator.hide();
		},		
		
		onAddPlacement : function(oEvent) {
			this.getView().getModel().fetchData("rest/publicationLangs", "/PublicationLanguages", true);
			this._initEmptyPlacement();
			if(!this._oNewPlacement) {
				this._oNewPlacement = sap.ui.xmlfragment("createPublisher", "org.eae.tools.view.fragments.AddPlacement", this);
				this.getView().addDependent(this._oNewPlacement);	
			}
			this._oNewPlacement.open();
		},
		
		handleUpdateBinding : function(oEvent) {
			var oTableHeader = this.getView().byId("tableHeader");
			var oPublishersText = this.getView().getModel("i18n").getProperty("placement_plural");
			var iPlacementsCount = oEvent.getSource().getBinding("items").getLength();
			
			oTableHeader.setText(oPublishersText + "(" + iPlacementsCount + ")");
		},

		onCreatePlacementRecord : function(oEvent) {
			var oModel = this.getView().getModel();
			var oParams = oModel.getProperty("/ui/createPlacement");
			oModel.createObject("rest/placements/create/",
					JSON.stringify(oParams),
					"POST",
					"/Placements", 
					true
			).then(function(){
				console.log("Created Language. Do nothing");
				this._oNewPlacement.close();
			}.bind(this));
			
			this._initEmptyPlacement();

		},
		
		onCancelCreatePlacementRecord : function(oEvent) {
			this._oNewPlacement.close();
		},
		
		handleDeletePlacement : function(oEvent) {
			var guidToDelete = oEvent.getParameter("listItem").getBindingContext().getProperty("guid");
			var oModel = this.getView().getModel();
			oModel.removeById("rest/placements/delete/" + guidToDelete).then(function(){
				this.refreshTable();
			}.bind(this))	
		},
		
		_initEmptyPlacement : function() {
			this.getView().getModel().setProperty("/ui/createPlacement", {});
			this.getView().getModel().setProperty("/ui/createPlacement/language", {});
		},
		
		onNavigateToPlacement : function (oEvent) {
			var oPlacement = oEvent.getParameter("srcControl").getBindingContext().getObject();
			oPlacement.guid
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("placementOverview", {
				placementId : oPlacement.guid
			});
		},
		onPlacementSearch : function(oEvent) {
			var oAssignedPublishers = this.getView().byId("table");
			var oListBinding = oAssignedPublishers.getBinding("items");
			
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			
			if (sQuery && sQuery.length > 0) {
				var typeFilter = new sap.ui.model.Filter("type", sap.ui.model.FilterOperator.Contains, sQuery);
				var neglishNameFilter = new sap.ui.model.Filter("englishName", sap.ui.model.FilterOperator.Contains, sQuery);
				var langNameFilter = new sap.ui.model.Filter("language/langName", sap.ui.model.FilterOperator.Contains, sQuery);
				var origLangName = new sap.ui.model.Filter("language/originaLangName", sap.ui.model.FilterOperator.EQ, sQuery);
				
				aFilters.push(typeFilter);
				aFilters.push(neglishNameFilter);
				aFilters.push(langNameFilter);
				aFilters.push(origLangName);
			}
			var oOrFilter = new sap.ui.model.Filter({
				filters : aFilters,
				and: false
			})
			oListBinding.filter(aFilters.length == 0 ? [] : oOrFilter, "Application");
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
		}
	});
});