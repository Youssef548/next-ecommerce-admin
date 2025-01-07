"use client";

import { useEffect, useRef, useState } from "react";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { initializeApp } from "firebase/app";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

interface MultiImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleUpload = async (files: FileList) => {
    if (!files.length) return;
    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      const downloadURLs = await Promise.all(uploadPromises);

      onChange([...value, ...downloadURLs]);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (url: string) => {
    try {
      const filePath = decodeURIComponent(
        url
          .split(`${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/`)[1]
          .split("?")[0]
      );
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      onRemove(url);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div
            key={index}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => handleRemove(url)}
                variant="destructive"
                size="icon"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}
      </div>
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        variant="secondary"
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : "Upload Images"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={disabled || isUploading}
        onChange={(e) => {
          const files = e.target.files;
          if (files) handleUpload(files);
        }}
        className="hidden"
      />
    </div>
  );
};

export default MultiImageUpload;
