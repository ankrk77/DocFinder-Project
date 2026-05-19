package com.docfinder.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DocfinderBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(DocfinderBackendApplication.class, args);
	}

}
