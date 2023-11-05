import Compressor from "compressorjs";
import { useState } from "react";
import { useUploadFileMutation } from "../lib/redux/slices/message/messageApi";

const useGetCompressedImage = () => {
	const [base64Img, setBase64Img] = useState<string>("");
	const [imgLink, setImgLink] = useState<string>("");
	const [fileLink, setFileLink] = useState<string>("");
	const [uploading, setUploading] = useState<boolean>(false);

	const [uploadFile] = useUploadFileMutation();

	const getBase64 = (file: File): Promise<string> => {
		return new Promise((resolve) => {
			let baseURL = "";
			// Make new FileReader
			const reader = new FileReader();

			reader.readAsDataURL(file);

			// on reader load something...
			reader.onload = () => {
				if (reader.result) {
					baseURL = reader.result.toString();
					resolve(baseURL);
				}
			};
		});
	};

	// Upload compress Image function start
	const handleCompressedUploadImage = (image: File) => {
		if (!image) {
			console.log("Image not found");
			return;
		}

		new Compressor(image, {
			quality: 0.6, // 0.6 can also be used, but it's not recommended to go below.
			success: async (compressedResult: File) => {
				// compressedResult has the compressed file.
				// Use the compressed file to upload the images to your server.
				const res = await getBase64(compressedResult);

				// imgbb image upload api start
				const baseUrl = res;
				setBase64Img(baseUrl);
				// const formData = new FormData();
				// const str = baseUrl.split(",")[1];
				// formData.append("image", str);
				const formData = new FormData();
				formData.append("file", compressedResult, compressedResult.name);

				try {
					/* const res = await fetch(
						`https://api.imgbb.com/1/upload?key=e911b7196eed8bf0e10bfe59de30c793`,
						{
							method: "POST",
							body: formData,
						}
					);
					const data = await res.json(); */
					const response = await uploadFile(formData).unwrap();

					setImgLink(response.fileUrl);
				} catch (err) {
					console.log(err);
				} finally {
					setUploading(false);
				}
				// imgbb image upload end
			},
		});
	};
	// Image compress function end

	// Upload File function start
	const handleFileUploadServer = async (file: File) => {
		if (!file) {
			console.log("File not found");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await uploadFile(formData).unwrap();
			setFileLink(response.fileUrl);
		} catch (error) {
			console.error("File upload failed:", error);
		} finally {
			setUploading(false);
		}
	};
	// Image compress function end

	return {
		handleCompressedUploadImage,
		base64Img,
		setBase64Img,
		imgLink,
		setImgLink,
		uploading,
		setUploading,
		handleFileUploadServer,
		fileLink,
		setFileLink,
	};
};

export default useGetCompressedImage;
