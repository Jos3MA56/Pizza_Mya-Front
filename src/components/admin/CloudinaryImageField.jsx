import { useRef, useState } from "react";
import Button from "../ui/Button.jsx";
import { useToast } from "../ui/ToastProvider.jsx";
import { adminCloudinaryApi } from "../../api/adminCloudinary.api.js";
import CloudinaryPickerModal from "./CloudinaryPickerModal.jsx";

export default function CloudinaryImageField({
  token,
  folder = "pizza-mya/productos/?",
  value = "",
  onChange,
  label = "Imagen",
  placeholder = "https://...",
  pickerTitle = "Seleccionar imagen desde Cloudinary",
  previewAlt = "Vista previa",
  previewHeight = 220,
}) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openFilePicker = () => fileInputRef.current?.click();

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setUploading(true);
      const asset = await adminCloudinaryApi.upload({ token, folder, file });
      onChange?.(asset?.secure_url || "");
      toast.success("Imagen subida correctamente");
    } catch (error) {
      toast.error(error?.message || "No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 13,
              fontWeight: 700,
              color: "#334155",
            }}
          >
            {label}
          </label>
          <input
            type="url"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 14,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPickerOpen(true)}
          >
            Elegir Imagen
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={openFilePicker}
            loading={uploading}
            loadingText="Subiendo..."
          >
            Subir imagen
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange?.("")}
            >
              Quitar
            </Button>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        <div
          style={{
            minHeight: previewHeight,
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            background: "#f8fafc",
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
          }}
        >
          {value ? (
            <img
              src={value}
              alt={previewAlt}
              style={{
                width: "100%",
                height: previewHeight,
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span
              style={{
                color: "#64748b",
                fontWeight: 700,
                textAlign: "center",
                padding: 18,
              }}
            >
              Aquí se mostrará la imagen seleccionada
            </span>
          )}
        </div>
      </div>

      <CloudinaryPickerModal
        open={pickerOpen}
        token={token}
        title={pickerTitle}
        initialFolder={folder}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => onChange?.(asset?.secure_url || "")}
      />
    </>
  );
}
