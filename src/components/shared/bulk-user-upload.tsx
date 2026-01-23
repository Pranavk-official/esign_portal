"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserCreateRequest } from "@/lib/schemas/user";

interface BulkUserUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (users: UserCreateRequest[]) => Promise<void>;
  isLoading?: boolean;
}

interface ParsedUser {
  email: string;
  portal_id?: string | null;
  role_names: string[];
  send_otp: boolean;
}

export function BulkUserUpload({
  open,
  onOpenChange,
  onUpload,
  isLoading = false,
}: BulkUserUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    // Create template workbook
    const template = [
      {
        email: "user@example.com",
        portal_id: "portal-123",
        roles: "portal_admin,portal_user",
        send_otp: "TRUE",
      },
      {
        email: "another@example.com",
        portal_id: "portal-456",
        roles: "portal_user",
        send_otp: "FALSE",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);

    // Set column widths
    ws["!cols"] = [
      { wch: 30 }, // email
      { wch: 20 }, // portal_id
      { wch: 30 }, // roles
      { wch: 10 }, // send_otp
    ];

    // Add header comments/notes
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");

    // Download
    XLSX.writeFile(wb, "bulk-users-template.xlsx");
    toast.success("Template downloaded successfully");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    parseExcelFile(selectedFile);
  };

  const parseExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

      if (jsonData.length === 0) {
        toast.error("Excel file is empty");
        return;
      }

      const users: ParsedUser[] = [];
      const errors: string[] = [];

      jsonData.forEach((row, index) => {
        const rowNumber = index + 2; // +2 because Excel rows are 1-indexed and first row is header

        // Validate required fields
        if (!row.email) {
          errors.push(`Row ${rowNumber}: Email is required`);
          return;
        }

        if (!row.roles) {
          errors.push(`Row ${rowNumber}: Roles are required`);
          return;
        }

        // Parse roles (comma-separated)
        const roleNames = row.roles
          .split(",")
          .map((r: string) => r.trim())
          .filter((r: string) => r.length > 0);

        if (roleNames.length === 0) {
          errors.push(`Row ${rowNumber}: At least one role is required`);
          return;
        }

        // Parse send_otp (default to true)
        let sendOtp = true;
        if (row.send_otp !== undefined) {
          const sendOtpStr = String(row.send_otp).toLowerCase();
          sendOtp = sendOtpStr === "true" || sendOtpStr === "1" || sendOtpStr === "yes";
        }

        // Parse portal_id (can be null/empty)
        const portalId =
          row.portal_id && String(row.portal_id).trim() ? String(row.portal_id).trim() : null;

        users.push({
          email: String(row.email).trim(),
          portal_id: portalId,
          role_names: roleNames,
          send_otp: sendOtp,
        });
      });

      if (errors.length > 0) {
        setParseErrors(errors);
        toast.error(`Found ${errors.length} validation error(s)`);
      } else if (users.length > 0) {
        setParsedUsers(users);
        setParseErrors([]);
        toast.success(`Parsed ${users.length} user(s) successfully`);
      }
    } catch (error) {
      console.error("Excel parse error:", error);
      toast.error("Failed to parse Excel file. Please check the format.");
    }
  };

  const handleUpload = async () => {
    if (parsedUsers.length === 0) {
      toast.error("No valid users to upload");
      return;
    }

    try {
      await onUpload(parsedUsers);
      // Reset state on success
      setFile(null);
      setParsedUsers([]);
      setParseErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFile(null);
      setParsedUsers([]);
      setParseErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk User Upload</DialogTitle>
          <DialogDescription>
            Upload an Excel file to create multiple users at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Download Template */}
          <div className="bg-muted/50 flex items-start gap-4 rounded-lg border p-4">
            <FileSpreadsheet className="text-muted-foreground mt-0.5 h-5 w-5" />
            <div className="flex-1">
              <h4 className="mb-1 text-sm font-medium">Download Template</h4>
              <p className="text-muted-foreground mb-3 text-sm">
                Download the Excel template with the required format and sample data
              </p>
              <Button variant="outline" size="sm" onClick={downloadTemplate} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Excel File</label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            {file && <p className="text-muted-foreground text-sm">Selected: {file.name}</p>}
          </div>

          {/* Parse Results */}
          {parsedUsers.length > 0 && (
            <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
              <div className="mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {parsedUsers.length} user(s) ready to create
                </span>
              </div>
              <div className="text-muted-foreground max-h-40 overflow-y-auto text-sm">
                {parsedUsers.slice(0, 5).map((user, idx) => (
                  <div key={idx} className="py-1">
                    • {user.email} ({user.role_names.join(", ")})
                  </div>
                ))}
                {parsedUsers.length > 5 && (
                  <div className="py-1 text-xs italic">... and {parsedUsers.length - 5} more</div>
                )}
              </div>
            </div>
          )}

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <div className="rounded-lg border bg-red-50 p-4 dark:bg-red-950/20">
              <div className="mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {parseErrors.length} validation error(s)
                </span>
              </div>
              <div className="text-muted-foreground max-h-40 space-y-1 overflow-y-auto text-sm">
                {parseErrors.map((error, idx) => (
                  <div key={idx}>• {error}</div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
            <h4 className="mb-2 text-sm font-medium">Excel Format Instructions</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                • <strong>email</strong>: User's email address (required)
              </li>
              <li>
                • <strong>portal_id</strong>: Portal identifier (optional, leave empty for no
                portal)
              </li>
              <li>
                • <strong>roles</strong>: Comma-separated role names (required, e.g.,
                "portal_admin,portal_user")
              </li>
              <li>
                • <strong>send_otp</strong>: TRUE or FALSE (optional, defaults to TRUE)
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={parsedUsers.length === 0 || parseErrors.length > 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Users...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create {parsedUsers.length} User(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
