import content from "../../../../../../technologies/rpg/curriculum/modules/M02-anatomia-rpg/m02-content.json";
import LearningModulePage, { type LearningModuleContent } from "../m01/LearningModulePage";

type Props = {
  onBack: () => void;
  onComplete?: (score: number) => void;
  accountKey?: string | null;
  technologyCode: string;
  moduleCode: string;
};

export default function M02ModulePage(props: Props) {
  return (
    <LearningModulePage
      {...props}
      moduleContent={content satisfies LearningModuleContent}
    />
  );
}
