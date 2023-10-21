export type ApiResponseType<T> = {
	statusCode: number;
	success: boolean;
	message?: string | null;
	count?: number | null;
	meta?: {
		page: number;
		limit: number;
		total: number;
	} | null;
	data?: T | null;
};
