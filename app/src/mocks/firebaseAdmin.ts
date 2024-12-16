const mockFirebaseAdmin = {
	authAdmin: {
		createUser: jest.fn()
	},
	firestore: {
		Timestamp: {
			now: jest.fn().mockReturnValue({
				toDate: () => new Date()
			})
		}
	}
};

export default mockFirebaseAdmin;
