"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { todosAPI, Todo } from "@/lib/api";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  ListTodo,
} from "lucide-react";

type Filter = "all" | "active" | "completed";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const fetchTodos = async () => {
    try {
      const data = await todosAPI.list();
      setTodos(data);
    } catch (e) {
      console.error("Failed to fetch todos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAdd = async () => {
    const text = newText.trim();
    if (!text) return;
    try {
      const created = await todosAPI.create(text);
      setTodos((prev) => [...prev, created]);
      setNewText("");
    } catch (e) {
      console.error("Failed to create todo:", e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const updated = await todosAPI.update(todo.id, { is_done: !todo.is_done });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch (e) {
      console.error("Failed to toggle todo:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await todosAPI.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Failed to delete todo:", e);
    }
  };

  const handleEditSave = async (id: string) => {
    const text = editText.trim();
    if (!text) return;
    try {
      const updated = await todosAPI.update(id, { text });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
    } catch (e) {
      console.error("Failed to update todo:", e);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newTodos = [...filteredTodos];
    [newTodos[index - 1], newTodos[index]] = [newTodos[index], newTodos[index - 1]];
    const ids = newTodos.map((t) => t.id);
    try {
      const updated = await todosAPI.reorder(ids);
      setTodos(updated);
    } catch (e) {
      console.error("Failed to reorder:", e);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === filteredTodos.length - 1) return;
    const newTodos = [...filteredTodos];
    [newTodos[index], newTodos[index + 1]] = [newTodos[index + 1], newTodos[index]];
    const ids = newTodos.map((t) => t.id);
    try {
      const updated = await todosAPI.reorder(ids);
      setTodos(updated);
    } catch (e) {
      console.error("Failed to reorder:", e);
    }
  };

  const handleClearCompleted = async () => {
    try {
      await todosAPI.clearCompleted();
      setTodos((prev) => prev.filter((t) => !t.is_done));
    } catch (e) {
      console.error("Failed to clear completed:", e);
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.is_done;
    if (filter === "completed") return t.is_done;
    return true;
  });

  const activeCount = todos.filter((t) => !t.is_done).length;
  const completedCount = todos.filter((t) => t.is_done).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Todos</h1>
        <p className="text-muted-foreground">Quick task dump and checklist</p>
      </div>

      {/* Add todo */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={!newText.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" && `All (${todos.length})`}
              {f === "active" && `Active (${activeCount})`}
              {f === "completed" && `Done (${completedCount})`}
            </Button>
          ))}
        </div>
        {completedCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                Clear completed
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear completed todos?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {completedCount} completed todo{completedCount > 1 ? "s" : ""}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleClearCompleted}
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Todo list */}
      {filteredTodos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {filter === "all" ? "No todos yet" : filter === "active" ? "No active todos" : "No completed todos"}
            </h3>
            <p className="text-muted-foreground">
              {filter === "all" ? "Add your first task above" : ""}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map((todo, index) => (
            <Card key={todo.id} className="group">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={todo.is_done}
                    onCheckedChange={() => handleToggle(todo)}
                  />

                  {editingId === todo.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(todo.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1"
                      />
                      <Button size="sm" variant="ghost" onClick={() => handleEditSave(todo.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span
                      className={`flex-1 text-sm ${todo.is_done ? "line-through text-muted-foreground" : ""}`}
                    >
                      {todo.text}
                    </span>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === filteredTodos.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditText(todo.text);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(todo.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
