"use client";

import React, { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, DocumentData, limit, where, Timestamp } from "firebase/firestore";
import { FileText, Link as LinkIcon, Loader2 } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth, db } from "../../firebase";

type ResumeMetadata = {
  id: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadDate: string; 
  uid: string;
  storagePath: string;
};

type GroupedResumes = {
  [uid: string]: ResumeMetadata[];
};

const RESUMES_COLLECTION = "user_resumes";
const ACCOUNTS_COLLECTION = "accounts";

const ResumeLists: React.FC = () => {
  const [groupedResumes, setGroupedResumes] = useState<GroupedResumes>({});
  const [applicantNames, setApplicantNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    if (!auth) {
      setError("Authentication service not initialized.");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserAdmin(true);
      } else {
        setIsUserAdmin(false);
        setIsLoading(false);
        setError("You must be logged in to view applicant resumes.");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchApplicantNames = useCallback(async (uids: string[]) => {
    if (!db || uids.length === 0) return {};

    const nameMap: Record<string, string> = {};
    try {
      const namePromises = uids.map(uid => getDocs(query(collection(db, ACCOUNTS_COLLECTION), where('uid', '==', uid), limit(1))));
      const snapshots = await Promise.all(namePromises);

      snapshots.forEach(snapshot => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          const uid = data.uid;
          const name = data.firstName && data.lastName
            ? `${data.firstName} ${data.lastName}`
            : data.email || uid;
          nameMap[uid] = name;
        }
      });
    } catch (e) {
      console.error("Error fetching applicant names:", e);
    }
    return nameMap;
  }, []);
 useEffect(() => {
    if (!db || !isUserAdmin) return;

    const loadResumes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const q = query(collection(db, RESUMES_COLLECTION));
        const snapshot = await getDocs(q);

        const rawResumes: ResumeMetadata[] = [];
        const uniqueUids = new Set<string>();

        snapshot.forEach((doc) => {
          const data = doc.data() as DocumentData & { uploadDate: Timestamp };

          const resume: ResumeMetadata = {
            id: doc.id,
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileUrl: data.fileUrl,
            uploadDate: data.uploadDate ? data.uploadDate.toDate().toLocaleDateString() : 'N/A',
            storagePath: data.storagePath,
            uid: data.uid,
          };
          rawResumes.push(resume);
          uniqueUids.add(data.uid);
        });

        // Group the resumes by UID
        const grouped = rawResumes.reduce<GroupedResumes>((acc, resume) => {
          if (!acc[resume.uid]) {
            acc[resume.uid] = [];
          }
          acc[resume.uid].push(resume);
          return acc;
        }, {});

        setGroupedResumes(grouped);

        // Fetch display names for all UIDs
        const namesMap = await fetchApplicantNames(Array.from(uniqueUids));
        setApplicantNames(namesMap);

      } catch (err) {
        console.error("Error fetching all resumes:", err);
        setError("Failed to fetch all resumes from Firestore.");
      } finally {
        setIsLoading(false);
      }
    };

    loadResumes();
  }, [db, isUserAdmin, fetchApplicantNames]);

  const handleViewFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[750px] bg-dark-1 rounded-xl p-6">
        <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
        <p className="text-white text-lg">Loading all applicant data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[750px] bg-dark-1 rounded-xl p-6">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (Object.keys(groupedResumes).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[750px] bg-dark-1 rounded-xl p-6">
        <p className="text-gray-400 text-xl">No resumes found across all applicants.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1F2E] text-white rounded-xl shadow-lg p-6 h-[750px] overflow-y-auto custom-scrollbar">
      <h1 className="text-3xl font-bold mb-6 text-white border-b border-dark-2 pb-3">
        Applicant Resume Management ({Object.keys(groupedResumes).length} Applicants)
      </h1>

      <div className="space-y-8">
        {Object.entries(groupedResumes).map(([uid, resumes]) => {
          const applicantName = applicantNames[uid] || `User ID: ${uid}`;

          return (
            <div key={uid} className="bg-[#2C2C3E] p-5 rounded-xl border border-dark-2">
              <h2 className="text-xl font-semibold mb-3 text-blue-400">
                Applicant: {applicantName}
              </h2>
              <p className="text-sm text-gray-400 mb-4">Total Resumes: {resumes.length}</p>

              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between bg-[#1E1E2F] p-3 rounded-lg border border-dark-3 transition hover:bg-[#3C3C4E]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={24} className="text-green-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{resume.fileName}</p>
                        <p className="text-xs text-gray-400">
                          {resume.fileSize} uploaded on {resume.uploadDate}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewFile(resume.fileUrl)}
                      className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-300 transition flex-shrink-0 ml-4"
                      aria-label={`View ${resume.fileName}`}
                    >
                      View <LinkIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResumeLists;