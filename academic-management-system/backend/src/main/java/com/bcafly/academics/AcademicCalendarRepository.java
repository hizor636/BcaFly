package com.bcafly.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AcademicCalendarRepository extends JpaRepository<AcademicCalendar, Long> {
    List<AcademicCalendar> findBySemesterId(Long semesterId);
    List<AcademicCalendar> findByEventDateBetween(LocalDate start, LocalDate end);
}
