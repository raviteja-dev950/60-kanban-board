package com.raviteja.kanban.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/kanban")
@CrossOrigin(origins = "*")
public class KanbanController {

    List<Map<String, Object>> tasks = new ArrayList<>();

    public KanbanController() {
        addTask(1, "Design Project 60 UI", "To Do", "High");
        addTask(2, "Create Backend API", "Doing", "High");
        addTask(3, "Test Drag & Drop", "To Do", "Medium");
        addTask(4, "Project 59 - Chat UI Completed!", "Done", "High");
        addTask(5, "Write README.md", "Doing", "Low");
        addTask(6, "Deploy to GitHub", "To Do", "Medium");
    }

    private void addTask(int id, String title, String status, String priority) {
        Map<String, Object> t = new HashMap<>();
        t.put("id", id);
        t.put("title", title);
        t.put("status", status);
        t.put("priority", priority);
        t.put("time", "09:00");
        tasks.add(t);
    }

    @GetMapping("/test")
    public String test() {
        return "WORKING 60!";
    }

    @GetMapping("/tasks")
    public List<Map<String, Object>> getTasks() {
        return tasks;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        long todo = tasks.stream().filter(t -> "To Do".equals(t.get("status"))).count();
        long doing = tasks.stream().filter(t -> "Doing".equals(t.get("status"))).count();
        long done = tasks.stream().filter(t -> "Done".equals(t.get("status"))).count();
        stats.put("total", tasks.size());
        stats.put("todo", todo);
        stats.put("doing", doing);
        stats.put("done", done);
        return stats;
    }

    @PostMapping("/tasks")
    public Map<String, Object> addNewTask(@RequestBody Map<String, String> payload) {
        Map<String, Object> task = new HashMap<>();
        task.put("id", tasks.size() + 1);
        task.put("title", payload.get("title"));
        task.put("status", payload.getOrDefault("status", "To Do"));
        task.put("priority", payload.getOrDefault("priority", "Medium"));
        task.put("time", java.time.LocalTime.now().toString().substring(0, 5));
        tasks.add(task);
        return task;
    }

    @PutMapping("/tasks/{id}")
    public Map<String, Object> updateStatus(@PathVariable int id, @RequestBody Map<String, String> payload) {
        for (Map<String, Object> t : tasks) {
            if ((int) t.get("id") == id) {
                if (payload.containsKey("status")) {
                    t.put("status", payload.get("status"));
                }
                return t;
            }
        }
        return null;
    }

    @DeleteMapping("/tasks/{id}")
    public String deleteTask(@PathVariable int id) {
        tasks.removeIf(t -> (int) t.get("id") == id);
        return "Deleted Task " + id;
    }
}