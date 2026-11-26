import content from "../../../../../../technologies/rpg/curriculum/modules/M03-variables-tipos/m03-u01-content.json";
import nextUnit from "../../../../../../technologies/rpg/curriculum/modules/M03-variables-tipos/m03-u02-content.json";
import thirdUnit from "../../../../../../technologies/rpg/curriculum/modules/M03-variables-tipos/m03-u03-content.json";
import LearningModulePage, {
  type LearningModuleContent,
} from "../m01/LearningModulePage";

type Props = {
  onBack: () => void;
  accountKey?: string | null;
  technologyCode: string;
  moduleCode: string;
};

export default function M03U01ModulePage(props: Props) {
  return (
    <LearningModulePage
      {...props}
      moduleContent={{
        ...content,
        module: {
          ...content.module,
          estimatedMinutes:
            content.module.estimatedMinutes
            + nextUnit.module.estimatedMinutes
            + thirdUnit.module.estimatedMinutes,
        },
        sections: [
          ...content.sections,
          ...nextUnit.sections,
          ...thirdUnit.sections,
        ],
      } satisfies LearningModuleContent}
      completionMode="units"
    />
  );
}
