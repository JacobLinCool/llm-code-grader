import { grade, type GradeOptions, type GradeResult } from './grade';

export class CodeGrader {
    constructor(private options: Pick<GradeOptions, 'gradingPolicy' | 'attachments'>) {}

    public async grade(
        opt: Omit<GradeOptions, 'gradingPolicy' | 'attachments'>,
    ): Promise<GradeResult> {
        return grade({ ...this.options, ...opt });
    }
}
