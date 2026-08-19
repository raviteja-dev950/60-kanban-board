import { useState, useEffect } from "react";
import api from "../api/api";

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, doing: 0, done: 0 });
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      const res = await api.get("/kanban/tasks");
      setTasks(res.data);
    } catch (err) {
      console.log("Error fetching tasks", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/kanban/stats");
      setStats(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [tasks]);

  // Add Task
  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await api.post("/kanban/tasks", {
        title: newTitle,
        status: "To Do",
        priority: newPriority,
      });
      setTasks([...tasks, res.data]);
      setNewTitle("");
    } catch (err) {
      console.log(err);
    }
  };

  // Move Task - To Do -> Doing -> Done
  const moveTask = async (id, currentStatus) => {
    let nextStatus = "To Do";
    if (currentStatus === "To Do") nextStatus = "Doing";
    else if (currentStatus === "Doing") nextStatus = "Done";
    else if (currentStatus === "Done") nextStatus = "To Do";

    try {
      await api.put(`/kanban/tasks/${id}`, { status: nextStatus });
      setTasks(tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    } catch (err) {}
  };

  // Delete
  const deleteTask = async (id) => {
    try {
      await api.delete(`/kanban/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {}
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const priorityColor = (p) => {
    if (p === "High") return "#FF5252";
    if (p === "Medium") return "#FFC107";
    return "#4CAF50";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Arial" }}>
      {/* Header */}
      <div style={{ background: "#0F172A", color: "white", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>📌 Ravi's Kanban - 60/100</h2>
          <small style={{ color: "#94A3B8" }}>Project 60 - Drag Tasks To Do → Doing → Done</small>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <span style={{ background: "#1E293B", padding: "6px 12px", borderRadius: "20px" }}>Total: {stats.total}</span>
          <span style={{ background: "#334155", padding: "6px 12px", borderRadius: "20px" }}>To Do: {stats.todo}</span>
          <span style={{ background: "#EAB308", color: "black", padding: "6px 12px", borderRadius: "20px" }}>Doing: {stats.doing}</span>
          <span style={{ background: "#22C55E", padding: "6px 12px", borderRadius: "20px" }}>Done: {stats.done}</span>
        </div>
      </div>

      {/* Add Task */}
      <div style={{ padding: "15px", background: "#F1F5F9", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add new task... e.g. Build Project 60"
          style={{ flex: 1, padding: "10px 15px", borderRadius: "8px", border: "1px solid #CBD5E1", outline: "none" }}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
        />
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button onClick={addTask} style={{ background: "#0F172A", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
          + Add Task
        </button>
      </div>

      {/* Board */}
      <div style={{ display: "flex", flex: 1, gap: "15px", padding: "15px", background: "#E2E8F0", overflow: "auto" }}>
        {/* To Do Column */}
        <div style={{ flex: 1, background: "#FFFFFF", borderRadius: "12px", padding: "15px", minWidth: "280px" }}>
          <h3 style={{ margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ background: "#E2E8F0", padding: "4px 10px", borderRadius: "20px", fontSize: "14px" }}>📋 To Do - {getTasksByStatus("To Do").length}</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {getTasksByStatus("To Do").map(task => (
              <div key={task.id} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderLeft: `5px solid ${priorityColor(task.priority)}`, borderRadius: "8px", padding: "12px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "6px" }}>{task.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", background: priorityColor(task.priority), color: "white", padding: "2px 8px", borderRadius: "10px" }}>{task.priority}</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => moveTask(task.id, task.status)} style={{ background: "#EAB308", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>→ Doing</button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: "#FEE2E2", border: "none", padding: "5px 8px", borderRadius: "6px", cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doing Column */}
        <div style={{ flex: 1, background: "#FFFFFF", borderRadius: "12px", padding: "15px", minWidth: "280px" }}>
          <h3 style={{ margin: "0 0 15px 0" }}>
            <span style={{ background: "#FEF3C7", padding: "4px 10px", borderRadius: "20px", fontSize: "14px" }}>⚡ Doing - {getTasksByStatus("Doing").length}</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {getTasksByStatus("Doing").map(task => (
              <div key={task.id} style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderLeft: `5px solid ${priorityColor(task.priority)}`, borderRadius: "8px", padding: "12px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "6px" }}>{task.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", background: priorityColor(task.priority), color: "white", padding: "2px 8px", borderRadius: "10px" }}>{task.priority}</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => moveTask(task.id, task.status)} style={{ background: "#22C55E", color: "white", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>→ Done</button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: "#FEE2E2", border: "none", padding: "5px 8px", borderRadius: "6px", cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div style={{ flex: 1, background: "#FFFFFF", borderRadius: "12px", padding: "15px", minWidth: "280px" }}>
          <h3 style={{ margin: "0 0 15px 0" }}>
            <span style={{ background: "#DCFCE7", padding: "4px 10px", borderRadius: "20px", fontSize: "14px" }}>✅ Done - {getTasksByStatus("Done").length}</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {getTasksByStatus("Done").map(task => (
              <div key={task.id} style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderLeft: `5px solid ${priorityColor(task.priority)}`, borderRadius: "8px", padding: "12px", opacity: 0.8 }}>
                <div style={{ fontWeight: "bold", marginBottom: "6px", textDecoration: "line-through" }}>{task.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", background: priorityColor(task.priority), color: "white", padding: "2px 8px", borderRadius: "10px" }}>{task.priority}</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => moveTask(task.id, task.status)} style={{ background: "#E2E8F0", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>↩ To Do</button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: "#FEE2E2", border: "none", padding: "5px 8px", borderRadius: "6px", cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard;
