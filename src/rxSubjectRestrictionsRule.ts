import * as ts from 'typescript';
import * as Lint from 'tslint';

import { hasModifier } from 'tsutils';

const ALLOW_PUBLIC = "allow-public";

export class Rule extends Lint.Rules.AbstractRule {
    public static MODIFIER_FAILURE_STRING = 'Public access modifier for RxJS Subject is not allowed';
    public static NAMING_FAILURE_STRING = 'The name of RxJS Subject variable must ends with "$"';
    public static NO_MODIFIER_FAILURE_STRING = 'RxJS Subject must have access modifier';

    public static metadata: Lint.IRuleMetadata = {
        ruleName: 'rx-subject-restrictions',
        description: 'Strict access modifier and naming for RxJS BehaviourSubject',
        rationale: Lint.Utils.dedent`It is a good practice to indicate our observable property names with "$" at the end 
        to allow other developers know that this property is Observable type. `,
        optionsDescription: Lint.Utils.dedent`You can restrict the access modifiers for your subject properties. If no option
        is provided subject can have private and protected access modifier.`,
        options: {
            type: "array",
            items: {
                type: "string",
                enum: [ALLOW_PUBLIC]
            },
        },
        optionExamples: [true, [true, ALLOW_PUBLIC]],
        type: 'typescript',
        typescriptOnly: false,
        hasFix: false
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RxBehaviorSubjectWalker(sourceFile, this.getOptions()));
    }
}

const SUBJECTS = ['AsyncSubject', 'BehaviorSubject', 'ReplaySubject', 'Subject', 'SubjectSubscriber', 'AnonymousSubject'];

class RxBehaviorSubjectWalker extends Lint.RuleWalker {
    public visitPropertyDeclaration(node: ts.PropertyDeclaration) {
        this.check(node);
        super.visitPropertyDeclaration(node);
    }

    public isRxObject(propertyConstructorText: string) {
        return SUBJECTS.some((subj): any => {
            return propertyConstructorText.includes(subj)
        });
    }

    protected checkAccessModifier(node: ts.PropertyDeclaration) {
        const propertyText = node.getText();
        const constructorDeclarationStartAt = propertyText.lastIndexOf('new ');
        const propertyConstructorText = propertyText.slice(constructorDeclarationStartAt);
        const isPublic = hasModifier(node.modifiers, ts.SyntaxKind.PublicKeyword);
        const isPublicAllowed = this.getOptions().includes(ALLOW_PUBLIC);
        const hasAllModifiers = hasModifier(
            node.modifiers,
            ts.SyntaxKind.PublicKeyword,
            ts.SyntaxKind.ProtectedKeyword,
            ts.SyntaxKind.StaticKeyword,
            ts.SyntaxKind.PrivateKeyword);

        if (!hasAllModifiers && this.isRxObject(propertyConstructorText) && !isPublicAllowed) {
            this.addFailureAtNode(node, Rule.NO_MODIFIER_FAILURE_STRING);

            if (isPublic && this.isRxObject(propertyConstructorText)) {
                this.addFailureAtNode(node, Rule.MODIFIER_FAILURE_STRING)
            } else {
                return;
            }
        }
        return;
    }

    protected checkNamingConvention(node: ts.PropertyDeclaration) {
        const propertyText = node.getText();
        const constructorDeclarationStartAt = propertyText.lastIndexOf('new ');
        const propertyConstructorText = propertyText.slice(constructorDeclarationStartAt);

        if (this.isRxObject(propertyConstructorText)) {
            const {name} = node as ts.PropertyDeclaration;
            const {text} = name as ts.Identifier;
            if (text.charAt(text.length - 1) !== '$') {
                this.addFailureAtNode(node, Rule.NAMING_FAILURE_STRING)
            }
        } else {
            return;
        }
    }

    protected check(node: ts.PropertyDeclaration): void {
        this.checkAccessModifier(node);
        this.checkNamingConvention(node)
    }
}