package com.bcafly.academics;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academics")
@SuppressWarnings("all")
public class AcademicController {

    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final AcademicCalendarRepository calendarRepository;

    public AcademicController(AcademicYearRepository academicYearRepository,
                              SemesterRepository semesterRepository,
                              SectionRepository sectionRepository,
                              SubjectRepository subjectRepository,
                              FacultyAssignmentRepository facultyAssignmentRepository,
                              AcademicCalendarRepository calendarRepository) {
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.facultyAssignmentRepository = facultyAssignmentRepository;
        this.calendarRepository = calendarRepository;
    }

    @GetMapping("/years")
    public List<AcademicYear> getAcademicYears() {
        return academicYearRepository.findAll();
    }

    @GetMapping("/semesters")
    public List<Semester> getSemesters(@RequestParam(required = false) Long yearId) {
        if (yearId != null) return semesterRepository.findByAcademicYearId(yearId);
        return semesterRepository.findAll();
    }

    @GetMapping("/sections")
    public List<Section> getSections(@RequestParam(required = false) Long semesterId) {
        if (semesterId != null) return sectionRepository.findBySemesterId(semesterId);
        return sectionRepository.findAll();
    }

    @GetMapping("/subjects")
    public List<Subject> getSubjects(@RequestParam(required = false) Integer semester) {
        if (semester != null) return subjectRepository.findBySemesterNumberAndIsActiveTrue(semester);
        return subjectRepository.findByIsActiveTrue();
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }

    @GetMapping("/assignments")
    public List<FacultyAssignment> getAssignments(@RequestParam(required = false) Long facultyId,
                                                  @RequestParam(required = false) Long semesterId) {
        if (facultyId != null) return facultyAssignmentRepository.findByFacultyId(facultyId);
        if (semesterId != null) return facultyAssignmentRepository.findBySemesterId(semesterId);
        return facultyAssignmentRepository.findAll();
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public FacultyAssignment createAssignment(@RequestBody FacultyAssignment assignment) {
        return facultyAssignmentRepository.save(assignment);
    }

    @GetMapping("/calendar")
    public List<AcademicCalendar> getCalendar(@RequestParam(required = false) Long semesterId) {
        if (semesterId != null) return calendarRepository.findBySemesterId(semesterId);
        return calendarRepository.findAll();
    }

    @PostMapping("/calendar")
    @PreAuthorize("hasRole('ADMIN')")
    public AcademicCalendar addCalendarEvent(@RequestBody AcademicCalendar event) {
        return calendarRepository.save(event);
    }
}
