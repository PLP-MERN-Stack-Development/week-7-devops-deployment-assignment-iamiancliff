// File: src/components/BugForm.jsx

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function BugForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "Medium",
    status: "Open",
    priority: "Medium",
    assignedTo: "",
    reportedBy: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
  setFormData({ ...formData, attachment: e.target.files[0] });
};

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: "",
      description: "",
      severity: "Medium",
      status: "Open",
      priority: "Medium",
      assignedTo: "",
      reportedBy: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div>
        <Label>Title</Label>
        <Input name="title" value={formData.title || ''} onChange={handleChange} required />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea name="description" value={formData.description || ''} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Severity</Label>
          <select name="severity" value={formData.severity || ''} onChange={handleChange} required className="w-full border p-2 rounded">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>

        <div>
          <Label>Status</Label>
          <select name="status" value={formData.status || ''} onChange={handleChange} required className="w-full border p-2 rounded">
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>
        </div>

        <div>
          <Label>Priority</Label>
          <select name="priority" value={formData.priority || ''} onChange={handleChange} required className="w-full border p-2 rounded">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Assigned To</Label>
          <Input name="assignedTo" value={formData.assignedTo || ''} onChange={handleChange} />
        </div>

        <div>
          <Label>Due Date</Label>
          <Input
            type="date"
            name="dueDate"
            value={formData.dueDate || ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Attachment (PDF/Image)</Label>
          <Input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
        </div>
  
      <div>
          <Label>Reported By</Label>
          <Input name="reportedBy" value={formData.reportedBy || ''} onChange={handleChange} required />
        </div>
      </div>

      <Button type="submit">{initialData?._id ? "Update Bug" : "Submit"}</Button>
    </form>
  );
}
