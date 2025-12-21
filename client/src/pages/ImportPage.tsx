import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ImportResults {
  fte: { processed: number; errors: string[] };
  kpis: { processed: number; errors: string[] };
  podPerformance: { processed: number; errors: string[] };
}

interface ImportResponse {
  success: boolean;
  message: string;
  results: ImportResults;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ImportResults | null>(null);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/admin/import-metrics", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Import failed");
      }
      
      return response.json() as Promise<ImportResponse>;
    },
    onSuccess: (data) => {
      setResults(data.results);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResults(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleImport = () => {
    if (file) {
      importMutation.mutate(file);
    }
  };

  const downloadTemplate = () => {
    window.location.href = "/api/admin/import-template";
  };

  const totalProcessed = results 
    ? results.fte.processed + results.kpis.processed + results.podPerformance.processed 
    : 0;
  const totalErrors = results 
    ? results.fte.errors.length + results.kpis.errors.length + results.podPerformance.errors.length 
    : 0;

  return (
    <AppLayout title="Import Metrics" subtitle="Upload Excel files to update FTE, KPIs, and Pod Performance data">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Excel Import
            </CardTitle>
            <CardDescription>
              Upload an Excel file with sheets named "FTE", "KPIs", and "PodPerformance" to update initiative metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-end">
              <Button variant="outline" onClick={downloadTemplate} data-testid="button-download-template">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : file
                  ? "border-green-500 bg-green-50"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              data-testid="dropzone-file-upload"
            >
              <input {...getInputProps()} data-testid="input-file-upload" />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="h-12 w-12 text-green-600" />
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Drop another file to replace
                  </p>
                </div>
              ) : isDragActive ? (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-12 w-12 text-primary animate-bounce" />
                  <p className="font-medium text-primary">Drop the file here</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <p className="font-medium">Drag & drop an Excel file here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to select a file (max 5MB)
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleImport}
                disabled={!file || importMutation.isPending}
                size="lg"
                data-testid="button-import"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {importMutation.isError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Import Failed</AlertTitle>
            <AlertDescription>
              {importMutation.error instanceof Error
                ? importMutation.error.message
                : "An error occurred during import"}
            </AlertDescription>
          </Alert>
        )}

        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {totalErrors === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                Import Results
              </CardTitle>
              <CardDescription>
                Processed {totalProcessed} records
                {totalErrors > 0 && ` with ${totalErrors} errors`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">FTE Data</span>
                      <Badge variant={results.fte.errors.length > 0 ? "destructive" : "default"}>
                        {results.fte.processed} imported
                      </Badge>
                    </div>
                    {results.fte.errors.length > 0 && (
                      <p className="text-sm text-destructive mt-1">
                        {results.fte.errors.length} errors
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">KPIs</span>
                      <Badge variant={results.kpis.errors.length > 0 ? "destructive" : "default"}>
                        {results.kpis.processed} imported
                      </Badge>
                    </div>
                    {results.kpis.errors.length > 0 && (
                      <p className="text-sm text-destructive mt-1">
                        {results.kpis.errors.length} errors
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pod Performance</span>
                      <Badge variant={results.podPerformance.errors.length > 0 ? "destructive" : "default"}>
                        {results.podPerformance.processed} imported
                      </Badge>
                    </div>
                    {results.podPerformance.errors.length > 0 && (
                      <p className="text-sm text-destructive mt-1">
                        {results.podPerformance.errors.length} errors
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {totalErrors > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Errors</h4>
                  <div className="max-h-60 overflow-y-auto rounded border p-3 bg-destructive/5">
                    {results.fte.errors.map((error, i) => (
                      <p key={`fte-${i}`} className="text-sm text-destructive">
                        [FTE] {error}
                      </p>
                    ))}
                    {results.kpis.errors.map((error, i) => (
                      <p key={`kpi-${i}`} className="text-sm text-destructive">
                        [KPI] {error}
                      </p>
                    ))}
                    {results.podPerformance.errors.map((error, i) => (
                      <p key={`pod-${i}`} className="text-sm text-destructive">
                        [Pod] {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>File Format Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">FTE Sheet</h4>
              <p className="text-sm text-muted-foreground">
                Columns: InitiativeID, SnapshotDate, FTECommitted, FTEActual, Notes
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">KPIs Sheet</h4>
              <p className="text-sm text-muted-foreground">
                Columns: InitiativeID, KPIKey, PeriodStart, PeriodEnd, TargetValue, ActualValue, Status (green/yellow/red/offtrack), Notes
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">PodPerformance Sheet</h4>
              <p className="text-sm text-muted-foreground">
                Columns: InitiativeID, PodName, PeriodStart, PeriodEnd, Velocity, QualityScore, BacklogHealth, Notes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
