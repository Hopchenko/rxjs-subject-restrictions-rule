import * as ts from 'typescript';
import * as Lint from 'tslint';

import { hasModifier } from 'tsutils';

export class Rule extends Lint.Rules.AbstractRule {
    public static MODIFIER_FAILURE_STRING = 'Public access modifier for RxJS Subject is not allowed';
    public static NAMING_FAILURE_STRING = 'The name of RxJS Subject variable must ends with "$"';

    public static metadata: Lint.IRuleMetadata = {
        ruleName: 'rx-subject-restrictions',
        description: 'Strict access modifier and naming for RxJS BehaviourSubject',
        rationale: 'Helps maintain a convention in your codebase.',
        optionsDescription: 'Not configurable.',
        options: null,
        optionExamples: ['true'],
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
        let isIncludes = false;
        for (let i = 0; i < SUBJECTS.length; i++) {
            if (propertyConstructorText.includes(SUBJECTS[i])) {
                isIncludes = true;
            }
        }
        return isIncludes;
    }

    protected checkAccessModifier(node: ts.PropertyDeclaration) {
        const propertyText = node.getText();
        const constructorDeclarationStartAt = propertyText.lastIndexOf('new ');
        const propertyConstructorText = propertyText.slice(constructorDeclarationStartAt);
        const isPublic = hasModifier(node.modifiers, ts.SyntaxKind.PublicKeyword);

        if (isPublic && this.isRxObject(propertyConstructorText)) {
            this.addFailureAtNode(node, Rule.MODIFIER_FAILURE_STRING)
        } else {
            return;
        }
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