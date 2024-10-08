import { DistinctQuestion } from 'inquirer';
import { ProjectAnswers } from '../../types';
export declare function applyDefaultName(newDefaultName: string, questions: ReadonlyArray<DistinctQuestion<ProjectAnswers>>, defaultValues: Partial<ProjectAnswers>): {
    newQuestions: ReadonlyArray<DistinctQuestion<ProjectAnswers>>;
    newDefaultValues: Partial<ProjectAnswers>;
};
//# sourceMappingURL=apply-default-name.d.ts.map