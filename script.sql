CREATE TABLE notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `to` varchar(50) NOT NULL,
    `from` varchar(50),
    subject TEXT,
    body TEXT NOT NULL,
    schedule_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    is_sent    TINYINT(1) DEFAULT 0,
    sent_at    TIMESTAMP,
    type varchar(25),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    is_deleted TINYINT(1) DEFAULT 0
);
