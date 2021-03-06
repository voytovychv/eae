package com.eae.schedule.repo;


import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.eae.schedule.model.CartSchedule;
import com.eae.schedule.model.Shift;
import com.eae.schedule.model.ShiftReport;


public interface ShiftReportRepository extends JpaRepository<ShiftReport, String>{
	List<ShiftReport> findByShiftAndSchedule(Shift shift, CartSchedule schedule);
	List<ShiftReport> findByStartsAfterAndEndsBefore(Date starts, Date ends, Sort sort);
}
