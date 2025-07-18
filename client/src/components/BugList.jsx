import { Button } from "@/components/ui/button";

export default function BugList({ bugs, loading, onDelete, onEdit }) {
  if (loading) return <p>Loading...</p>;

  if (!Array.isArray(bugs)) {
    return <p>Something went wrong: bug list is invalid.</p>;
  }
  if (bugs.length === 0) return <p>No bugs found.</p>;

  return (
    <div className="space-y-4">
      {bugs.map((bug) => (
        <div key={bug._id} className="border rounded p-4 shadow-sm">
          <h2 className="text-lg font-semibold">{bug.title}</h2>
          <p className="text-sm text-gray-600">{bug.description}</p>
          <p className="text-sm">Severity: {bug.severity}</p>
          <p className="text-sm">Status: {bug.status}</p>
          <p className="text-sm">Priority: {bug.priority}</p>
          <p className="text-sm">Reported by: {bug.reportedBy}</p>

          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(bug)}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(bug._id)}>Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
