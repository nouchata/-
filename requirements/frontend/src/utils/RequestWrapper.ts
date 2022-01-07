import axios from "axios";

type CallbackError = (error: any) => void;

export class RequestWrapper {
	public static async get<T>(route: string, config?: any, callbackError?: CallbackError): Promise<T | undefined> {
		try 
		{
			const response = await axios.get(
				process.env.REACT_APP_BACKEND_ADDRESS + route,
				{ withCredentials: true, ...config });
			return response.data;
		}
		catch (error: any)
		{
			if (callbackError)
				callbackError(error);
			return undefined;
		}
	}

	public static async post<T>(route: string, data: any, callbackError?: CallbackError): Promise<T | undefined> {
		try 
		{
			const response = await axios.post(
				process.env.REACT_APP_BACKEND_ADDRESS + route,
				data,
				{ withCredentials: true });
			return response.data;
		}
		catch (error: any)
		{
			if (callbackError)
				callbackError(error);
			return undefined;
		}
	}

	public static async put<T>(route: string, data: any, callbackError?: CallbackError): Promise<T | undefined> {
		try 
		{
			const response = await axios.put(
				process.env.REACT_APP_BACKEND_ADDRESS + route,
				data,
				{ withCredentials: true });
			return response.data;
		}
		catch (error: any)
		{
			if (callbackError)
				callbackError(error);
			return undefined;
		}
	}

	public static async delete<T>(route: string, callbackError?: CallbackError): Promise<T | undefined> {
		try 
		{
			const response = await axios.delete(
				process.env.REACT_APP_BACKEND_ADDRESS + route,
				{ withCredentials: true });
			return response.data;
		}
		catch (error: any)
		{
			if (callbackError)
				callbackError(error);
			return undefined;
		}
	}

	public static async patch<T>(route: string, data: any, callbackError?: CallbackError): Promise<T | undefined> {
		try 
		{
			const response = await axios.patch(
				process.env.REACT_APP_BACKEND_ADDRESS + route,
				data,
				{ withCredentials: true });
			return response.data;
		}
		catch (error: any)
		{
			if (callbackError)
				callbackError(error);
			return undefined;
		}
	}
}
