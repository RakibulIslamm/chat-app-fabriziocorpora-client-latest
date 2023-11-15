export const overwriteOptionForCall = {
	disableSelfView: false,
	hideConferenceTimer: false,
	disableModeratorIndicator: true,
	hideConferenceSubject: true,
	defaultRemoteDisplayName: "Anonymous",
	defaultLocalDisplayName: "me",
	enableWelcomePage: false,
	disableDeepLinking: true,
	prejoinConfig: {
		enabled: false,
	},
	conferenceInfo: {
		// autoHide: ["subject"],
	},
	toolbarButtons: [
		"camera",
		"toggle-camera",
		"microphone",
		"toggle-microphone",
		"fullscreen",
		"hangup",
	],
	toolbarConfig: {
		alwaysVisible: true,
	},
	filmstrip: {
		disabled: true,
	},
	notifications: [
		"dialog.cameraConstraintFailedError",
		"dialog.screenSharingFailedTitle",
	],
	logging: {
		defaultLogLevel: "error",
	},
	apiLogLevels: ["error"],
};

export const interfaceConfigOverwrite = {
	SHOW_JITSI_WATERMARK: false,
	HIDE_DEEP_LINKING_LOGO: true,
	SHOW_BRAND_WATERMARK: false,
	SHOW_WATERMARK_FOR_GUESTS: false,
};
