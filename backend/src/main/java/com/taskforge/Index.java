package com.taskforge;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class Index {
        @GetMapping("/")
    public String test() {
        return "TaskForge Backend Running 🚀";
    }

}
