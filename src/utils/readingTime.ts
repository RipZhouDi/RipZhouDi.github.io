export function getReadingTimeLabel(raw: string): string {
	const cjkCharCount = (raw.match(/[\u3400-\u9fff]/g) ?? []).length;
	const latinWordCount = (raw
		.replace(/[\u3400-\u9fff]/g, ' ')
		.match(/\b[\w-]+\b/g) ?? []).length;

	const minutesFromCjk = cjkCharCount / 320;
	const minutesFromLatin = latinWordCount / 220;
	const minutes = Math.max(1, Math.ceil(minutesFromCjk + minutesFromLatin));

	return `约 ${minutes} 分钟阅读`;
}
