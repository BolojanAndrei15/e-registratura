"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "./data-table";
import { useQuery } from '@tanstack/react-query';
import React from "react";

export default function SectionInregistrari({ registerId, departmentId }) {
  // Lookup fetches
  const [statuses, setStatuses] = React.useState([]);
  const [documentTypes, setDocumentTypes] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    axios.get('/api/statuses').then(res => setStatuses(res.data)).catch(() => setStatuses([]));
    axios.get('/api/documentTypes').then(res => setDocumentTypes(res.data)).catch(() => setDocumentTypes([]));
    axios.get('/api/users').then(res => setUsers(res.data)).catch(() => setUsers([]));
  }, []);

  const statusLookup = React.useMemo(() => Object.fromEntries(statuses.map(s => [s.id, s.name])), [statuses]);
  const docTypeLookup = React.useMemo(() => Object.fromEntries(documentTypes.map(d => [d.id, d.name])), [documentTypes]);
  const userLookup = React.useMemo(() => Object.fromEntries(users.map(u => [u.id, u.name])), [users]);

  const {
    data = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['registrations', registerId, statusLookup, docTypeLookup, userLookup],
    queryFn: async () => {
      let url = "/api/registrations";
      if (registerId) url += `?registerId=${registerId}`;
      const res = await axios.get(url);
      const apiData = res.data;
      // Sort descending by registrationNo (nrInregistrare)
      const mapped = (apiData || []).map(item => ({
        id: item.id,
        nrInregistrare: item.registrationNo,
        tipDocument: docTypeLookup[item.documentTypeId] || item.documentTypeId,
        rezumat: item.summary,
        dataDocument: item.documentDate ? formatDate(item.documentDate) : (item.createdAt ? formatDate(item.createdAt) : ''),
        dataInregistrare: item.sentDate ? formatDate(item.sentDate) : (item.createdAt ? formatDate(item.createdAt) : ''),
        status: statusLookup[item.statusId] || item.statusId,
        destinatar: userLookup[item.handlerId] || item.handlerId,
        inregistratDe: userLookup[item.registrantId] || item.registrantId || '',
      }));
      return mapped.sort((a, b) => (b.nrInregistrare || 0) - (a.nrInregistrare || 0));
    },
    keepPreviousData: true,
    staleTime: 1000 * 60,
    enabled: !!registerId && statuses.length > 0 && documentTypes.length > 0 && users.length > 0,
  });

  // Fetch next registration number for modal
  const { data: nextRegistrationNo, isLoading: loadingNextNo } = useQuery({
    queryKey: ['nextRegistrationNo', registerId],
    queryFn: async () => {
      if (!registerId) return '';
      const res = await axios.get(`/api/nextRegistrationNo?registerId=${registerId}`);
      return res.data.nextRegistrationNo;
    },
    enabled: !!registerId,
  });

  if (loading) return <div className="p-8 text-center">Se încarcă...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error.message}</div>;

  return <DataTable data={data} nextRegistrationNo={nextRegistrationNo} loadingNextNo={loadingNextNo} users={users} documentTypes={documentTypes} statuses={statuses} registerId={registerId} departmentId={departmentId} />;
}

// helper pentru format dd.mm.yyyy
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}