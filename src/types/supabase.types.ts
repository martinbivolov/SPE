export interface Tag {
	id: string;
	name: string;
}

export interface ImagePickerOption {
	id: string;
	image_url: string;
	label: string;
	tag_id: string;
	weight: number;
}

export interface AnswerOption {
	id: string;
	label: string;
	sort_order: number;
}

export interface LifestyleQuestion {
	id: string;
	text: string;
	type: string;
	sort_order: number;
	answer_options: AnswerOption[];
}

export interface QuestionGroup {
	id: string;
	title: string;
	sort_order: number;
	lifestyle_questions: LifestyleQuestion[];
}

export interface SceneObject {
	id: string;
	label: string;
	image_url: string;
	sfx_url: string;
	x: number;
	y: number;
	size: number;
}

export interface SceneVersion {
	id: string;
	label: string;
	video_a_url: string;
	video_b_url: string;
	background_image_url: string;
	scene_objects: SceneObject[];
}
