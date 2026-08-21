package com.bcafly.portfolio;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OdRequestRepository extends JpaRepository<OdRequest, Long> {
    List<OdRequest> findByStudentId(Long studentId);
    List<OdRequest> findByHodStatus(String hodStatus);
}
