
import axios from 'axios'
import FormData from 'form-data'

class S3 {
    constructor(host, accessKey, secretKey) {
        // Validate parameters
        if (!host || typeof host !== 'string') {
            throw new Error('Host must be a non-empty string');
        }
        if (!accessKey || typeof accessKey !== 'string') {
            throw new Error('Access key must be a non-empty string');
        }
        if (!secretKey || typeof secretKey !== 'string') {
            throw new Error('Secret key must be a non-empty string');
        }

        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.baseUrl = host;
    }

    // Helper method to add auth headers
    _getAuthHeaders() {
        return {
            'access': this.accessKey,
            'secret': this.secretKey,
        }
    }

    async createBucket(bucketname) {
        const url = `${this.baseUrl}/${bucketname}`
        try {
            const response = await axios.put(url, { headers: this._getAuthHeaders() });
            // Here, response.data will be a stream.
            return response.data;
        } catch (error) {
            console.error('Error fetching file:', error);
            throw error;
        }
    }

    async putObject(bucket, objectName, stream) {
        const url = `${this.baseUrl}/${bucket}/${objectName}`
        const form = new FormData()
        form.append("file", stream, { filename: objectName })

        try {
            const response = await axios.put(url, form, { headers: { ...form.getHeaders(), ...this._getAuthHeaders() } })
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async getObject(bucket, objectName) {
        const url = `${this.baseUrl}/${bucket}/${objectName}`
        try {
            const response = await axios.get(url, { responseType: 'stream', headers: this._getAuthHeaders() });
            // Here, response.data will be a stream.
            return response.data;
        } catch (error) {
            console.error('Error fetching file:', error);
            throw error;
        }
    }

    async statObject(bucket, objectName) {
        const url = `${this.baseUrl}/${bucket}/${objectName}/stat`
        try {
            const response = await axios.get(url, { headers: this._getAuthHeaders() })
            return response.data
        } catch (error) {
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            } else {
                throw new Error(error.message)
            }
        }
    }

    async removeObject(bucket, objectName) {
        const url = `${this.baseUrl}/${bucket}/${objectName}`
        try {
            await axios.delete(url, { headers: this._getAuthHeaders() })
            console.log('File removed from storage')
        } catch (error) {
            console.error('Error removing file:', error);
        }
    }
}

export default S3