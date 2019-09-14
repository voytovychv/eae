sap.ui.define([
	"sap/ui/core/format/DateFormat"
], function(DateFormat){
	"use strict";
	return {
		formatPeriodDates : function(starts, ends) {
			var oDateFormat = DateFormat.getDateInstance({
			    pattern: "MMM d"
			});


			return oDateFormat.format(new Date(starts)) + " - " + oDateFormat.format(new Date(ends));
		},
		
		formatDayTitle : function(iDate){
			var oDate = new Date(iDate);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			    pattern: "E, MMM d"
			});

			return oDateFormat.format(oDate);
		},
		
		formatShiftTitle : function(starts, ends) {
			var oStarts = new Date(starts);
			var oEnds = new Date(ends);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			    pattern: "HH:mm"
			});
	
			return oDateFormat.format(oStarts)  + " - " + oDateFormat.format(oEnds);
		},
		
		formatDateRange : function(oDateString) {
			var oDate= new Date(oDateString);
			
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			    pattern: "E, MMM d"
			});
			
			return oDateFormat.format(oDate);
		},
		
		formatTimeRange : function(oDateStringFrom, oDateStringTo) {
			var oDateFrom = new Date(oDateStringFrom);
			var oDateTo = new Date(oDateStringTo);

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			    pattern: "HH:mm"
			});
			
			return oDateFormat.format(oDateFrom) + " - " + oDateFormat.format(oDateTo);
		}

	};
});