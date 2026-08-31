package com.bcafly.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadedDocumentRepository extends JpaRepository<UploadedDocument, String> {
}
