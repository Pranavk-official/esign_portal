"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MdDescription, MdKey, MdPerson } from "react-icons/md";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { portalsApi } from "@/lib/api/portals";
import type { ApiKeyDetailResponse, PortalListResponse } from "@/lib/api/types";

interface PortalStatisticsModalProps {
  portal: PortalListResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

const InfoField = ({ label, value, className = "" }: InfoFieldProps) => (
  <div className={className}>
    <p className="text-muted-foreground mb-1 text-xs sm:text-sm">{label}</p>
    <div className="text-sm font-medium break-words sm:text-base">{value}</div>
  </div>
);

interface ApiKeyCardProps {
  apiKey: ApiKeyDetailResponse;
}

const ApiKeyCard = ({ apiKey }: ApiKeyCardProps) => (
  <Card className="space-y-3 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium sm:text-base">
          {apiKey.key_name || "Unnamed"}
        </h4>
        <p className="text-muted-foreground truncate font-mono text-xs">{apiKey.key_prefix}...</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={apiKey.environment === "LIVE" ? "default" : "secondary"}
          className="text-xs"
        >
          {apiKey.environment}
        </Badge>
        <Badge variant={apiKey.is_active ? "default" : "destructive"} className="text-xs">
          {apiKey.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-muted-foreground text-xs">Max Limit</p>
        <p className="font-mono font-medium">
          {apiKey.max_txn_count === null ? "∞" : apiKey.max_txn_count.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Remaining</p>
        <p className="font-mono font-medium">
          {apiKey.remaining_txn_count === null ? "∞" : apiKey.remaining_txn_count.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Used</p>
        <p className="font-mono font-medium text-green-600">
          {apiKey.successful_txn_count.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Threshold</p>
        <p className="font-mono font-medium">
          {apiKey.max_txn_count_threshold === null ? "-" : `${apiKey.max_txn_count_threshold}%`}
        </p>
      </div>
      <div className="col-span-2">
        <p className="text-muted-foreground text-xs">Last Used</p>
        <p className="text-sm">
          {apiKey.last_used_at
            ? format(new Date(apiKey.last_used_at), "dd MMM yyyy, HH:mm")
            : "Never"}
        </p>
      </div>
    </div>
  </Card>
);

export function PortalStatisticsModal({ portal, open, onOpenChange }: PortalStatisticsModalProps) {
  const { data: keysData, isLoading: keysLoading } = useQuery({
    queryKey: ["portal-keys", portal?.portal_id],
    queryFn: () => portalsApi.listPortalKeys(portal!.portal_id, { page_size: 100 }),
    enabled: !!portal && open,
  });

  const { data: _usageData, isLoading: usageLoading } = useQuery({
    queryKey: ["portal-usage", portal?.portal_id],
    queryFn: () => portalsApi.getPortalUsage(portal!.portal_id, { page: 1, page_size: 1 }),
    enabled: !!portal && open,
  });

  if (!portal) return null;

  const isLoading = keysLoading || usageLoading;
  const apiKeys = (keysData?.items || []) as ApiKeyDetailResponse[];

  const totalTransactions = apiKeys.reduce((sum, key) => sum + key.successful_txn_count, 0);
  const lastUsedDates = apiKeys
    .map((key) => key.last_used_at)
    .filter((date): date is string => date !== null)
    .sort()
    .reverse();
  const lastTransactionAt = lastUsedDates.length > 0 ? lastUsedDates[0] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-[95vw] overflow-y-auto p-4 sm:max-w-[90vw] sm:p-6 lg:max-w-6xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="pr-8 text-xl font-bold sm:text-2xl">
            Portal Statistics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Portal Information */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Portal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoField label="Portal Name" value={portal.name} />
                <InfoField
                  label="Portal ID"
                  value={<span className="font-mono text-xs sm:text-sm">{portal.portal_id}</span>}
                />
                <InfoField
                  label="Status"
                  value={
                    <Badge variant={portal.is_active ? "default" : "secondary"}>
                      {portal.is_active ? "Active" : "Inactive"}
                    </Badge>
                  }
                />
                <InfoField
                  label="Created At"
                  value={
                    portal.created_at
                      ? format(new Date(portal.created_at), "dd MMM yyyy, HH:mm")
                      : "-"
                  }
                />
                <InfoField
                  label="Active Keys"
                  value={
                    <div className="flex items-center gap-2">
                      <MdKey className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                      <span className="font-medium text-green-600">{portal.active_key_count}</span>
                    </div>
                  }
                />
                <InfoField
                  label="Total Keys"
                  value={
                    <div className="flex items-center gap-2">
                      <MdKey className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                      <span className="font-medium">{portal.total_key_count}</span>
                    </div>
                  }
                />
                <InfoField
                  label="User Count"
                  value={
                    <div className="flex items-center gap-2">
                      <MdPerson className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                      <span className="font-medium">{portal.user_count}</span>
                    </div>
                  }
                />
                <InfoField
                  label="Live Key Limit"
                  value={portal.live_key_limit === null ? "Unlimited" : portal.live_key_limit}
                />
              </div>
              {portal.revoke_reason && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground mb-1 text-xs sm:text-sm">Revoke Reason</p>
                  <p className="text-xs break-words text-red-600 sm:text-sm">
                    {portal.revoke_reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Metrics */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Transaction Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 sm:p-4">
                    <div className="shrink-0 rounded-lg bg-purple-100 p-2">
                      <MdDescription className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xl font-bold sm:text-2xl">
                        {totalTransactions.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-xs">Total Successful Transactions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 sm:p-4">
                    <div className="shrink-0 rounded-lg bg-blue-100 p-2">
                      <MdKey className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        Transaction data is based on successful transactions from active API keys.
                        For detailed usage reports, view the portal usage page.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {lastTransactionAt && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-muted-foreground mb-1 text-xs sm:text-sm">Last Transaction</p>
                  <p className="text-xs font-medium sm:text-sm">
                    {format(new Date(lastTransactionAt), "dd MMM yyyy, HH:mm:ss")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Keys Details */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">API Keys</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full sm:h-32" />
                  <Skeleton className="h-24 w-full sm:h-32" />
                  <Skeleton className="h-24 w-full sm:h-32" />
                </div>
              ) : apiKeys.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">No API keys found</p>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="space-y-3 lg:hidden">
                    {apiKeys.map((key) => (
                      <ApiKeyCard key={key.id} apiKey={key} />
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden overflow-x-auto rounded-md border lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="min-w-[150px]">Key Name</TableHead>
                          <TableHead className="min-w-[110px]">Environment</TableHead>
                          <TableHead className="min-w-[90px]">Status</TableHead>
                          <TableHead className="min-w-[100px] text-right">Max Limit</TableHead>
                          <TableHead className="min-w-[110px] text-right">Remaining</TableHead>
                          <TableHead className="min-w-[90px] text-right">Used</TableHead>
                          <TableHead className="min-w-[100px] text-right">Threshold</TableHead>
                          <TableHead className="min-w-[130px]">Last Used</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {key.key_name || "Unnamed"}
                                </span>
                                <span className="text-muted-foreground font-mono text-xs">
                                  {key.key_prefix}...
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={key.environment === "LIVE" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {key.environment}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={key.is_active ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {key.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {key.max_txn_count === null
                                ? "∞"
                                : key.max_txn_count.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {key.remaining_txn_count === null
                                ? "∞"
                                : key.remaining_txn_count.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm text-green-600">
                              {key.successful_txn_count.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {key.max_txn_count_threshold === null
                                ? "-"
                                : `${key.max_txn_count_threshold}%`}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {key.last_used_at
                                ? format(new Date(key.last_used_at), "dd MMM yyyy")
                                : "Never"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
