import React, { useRef } from "react";
import { Toast } from "primereact/toast";
import { FileUpload } from "primereact/fileupload";

export default function AppUploadComponent() {
  const toast = useRef(null);

  const onUpload = () => {
    toast.current.show({
      severity: "info",
      summary: "Success",
      detail: "File Uploaded",
    });
  };

  const ipaUploader = async (event) => {
    // convert file to base64 encoded
    console.log(event);
    const file = event.files[0];
    console.log("uploading file: ", file);
    const formData = new FormData();
    formData.append("file", file);
    fetch("/api/apps/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((app) => {
        console.log(app);
        window.location.href = `/apps/${app._id}`;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast}></Toast>
      <FileUpload
        mode="basic"
        name="demo[]"
        accept=".ipa"
        url="/api/apps/upload"
        customUpload
        uploadHandler={ipaUploader}
        onUpload={onUpload}
      />
    </div>
  );
}
