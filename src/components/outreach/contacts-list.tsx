"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { contactsAPI, Contact, ContactField } from "@/lib/api";
import { Plus, Trash2, Pencil, User, X } from "lucide-react";

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<ContactField[]>([{ label: "", value: "" }]);

  const fetchContacts = async () => {
    try {
      const data = await contactsAPI.list();
      setContacts(data);
    } catch (e) {
      console.error("Failed to fetch contacts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const resetForm = () => {
    setName("");
    setFields([{ label: "", value: "" }]);
    setEditingContact(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setFields(contact.fields.length > 0 ? [...contact.fields] : [{ label: "", value: "" }]);
    setDialogOpen(true);
  };

  const handleAddField = () => {
    setFields((prev) => [...prev, { label: "", value: "" }]);
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: "label" | "value", val: string) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [key]: val } : f))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const cleanFields = fields.filter((f) => f.label.trim() || f.value.trim());

    try {
      if (editingContact) {
        const updated = await contactsAPI.update(editingContact.id, {
          name: name.trim(),
          fields: cleanFields,
        });
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? updated : c))
        );
      } else {
        const created = await contactsAPI.create({
          name: name.trim(),
          fields: cleanFields,
        });
        setContacts((prev) => [created, ...prev]);
      }
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      console.error("Failed to save contact:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contactsAPI.delete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error("Failed to delete contact:", e);
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No contacts yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Add contacts to keep track of recruiters, hiring managers, and referrals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-medium">{contact.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(contact)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>{contact.name}</strong> and all their info.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(contact.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {contact.fields.length > 0 && (
                  <div className="space-y-1.5">
                    {contact.fields.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-muted-foreground min-w-[80px]">{f.label}:</span>
                        <span className="truncate">{f.value}</span>
                      </div>
                    ))}
                    {contact.fields.length > 4 && (
                      <p className="text-xs text-muted-foreground">
                        +{contact.fields.length - 4} more fields
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fields</Label>
              <div className="space-y-2">
                {fields.map((field, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="Label (e.g. Company)"
                      value={field.label}
                      onChange={(e) => handleFieldChange(i, "label", e.target.value)}
                      className="w-[140px]"
                    />
                    <Input
                      placeholder="Value (e.g. Google)"
                      value={field.value}
                      onChange={(e) => handleFieldChange(i, "value", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveField(i)}
                      disabled={fields.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleAddField}>
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editingContact ? "Save Changes" : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
