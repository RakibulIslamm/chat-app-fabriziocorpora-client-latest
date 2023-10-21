import Compressor from "compressorjs";
import { useState } from "react";

const useGetCompressedImage = () => {
	const [base64Img, setBase64Img] = useState<string>("");
	const [imgLink, setImgLink] = useState<string>("");
	const [uploading, setUploading] = useState<boolean>(false);

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

	// Image compress function start
	const handleCompressedUpload = (image: File) => {
		if (!image) {
			console.log("Image not found");
			return;
		}
		new Compressor(image, {
			quality: 0.4, // 0.6 can also be used, but it's not recommended to go below.
			success: async (compressedResult: File) => {
				// compressedResult has the compressed file.
				// Use the compressed file to upload the images to your server.
				const res = await getBase64(compressedResult);

				// imgbb image upload api start
				const baseUrl = res;
				setBase64Img(baseUrl);
				const formData = new FormData();
				const str = baseUrl.split(",")[1];
				formData.append("image", str);

				try {
					const res = await fetch(
						`https://api.imgbb.com/1/upload?key=e911b7196eed8bf0e10bfe59de30c793`,
						{
							method: "POST",
							body: formData,
						}
					);
					const data = await res.json();
					setImgLink(data?.data?.display_url);
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

	return {
		handleCompressedUpload,
		base64Img,
		setBase64Img,
		imgLink,
		setImgLink,
		uploading,
		setUploading,
	};
};

export default useGetCompressedImage;
