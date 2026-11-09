import { test } from 'node:test';
import { expect } from 'expect';
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import ts from 'typescript';

const ROOT = resolve(import.meta.dirname, '../..');

// tsd only checks that a call errors. These pin what the developer sees:
// which argument the error is on, what it says, and what the editor completes.
const CURSOR = '/*|*/';

function languageService(source: string) {
  const dir = mkdtempSync(join(tmpdir(), 'riv-typed-hooks-'));
  const file = join(dir, 'probe.ts');
  const text = source.replace(
    "'./rewards.riv'",
    `'${join(ROOT, 'example/assets/rive/rewards.riv')}'`
  );
  writeFileSync(file, text.replaceAll(CURSOR, ''));
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ESNext,
    allowArbitraryExtensions: true,
    paths: { '@rive-app/react-native': [join(ROOT, 'src/index')] },
  };
  const service = ts.createLanguageService({
    getCompilationSettings: () => options,
    getScriptFileNames: () => [file],
    getScriptVersion: () => '1',
    getScriptSnapshot: (f) =>
      ts.sys.fileExists(f)
        ? ts.ScriptSnapshot.fromString(readFileSync(f, 'utf8'))
        : undefined,
    getCurrentDirectory: () => ROOT,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  });
  const plain = text.replaceAll(CURSOR, '');
  return {
    errors: () =>
      service.getSemanticDiagnostics(file).map((d) => ({
        at: plain.slice(d.start, d.start! + d.length!),
        message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      })),
    // String completions just inside the quotes following the cursor marker
    completions: () =>
      service
        .getCompletionsAtPosition(file, text.indexOf(CURSOR) + 1, {})
        ?.entries.filter((e) => e.kind === ts.ScriptElementKind.string)
        .map((e) => e.name),
  };
}

const PRELUDE = `import { useRiveNumber, useRiveEnum, useViewModelInstance, type RiveViewRef } from '@rive-app/react-native';
import rewardsRiv from './rewards.riv';
declare const ref: RiveViewRef | undefined;
export function Probe() {
  const { instance } = useViewModelInstance(ref, { async: true, asset: rewardsRiv, viewModelName: 'Rewards' });
`;

test('a wrong path is reported on the path, listing the valid ones', () => {
  const { errors } = languageService(
    `${PRELUDE}  useRiveNumber('Price_Valu', instance);\n}\n`
  );
  expect(errors()).toEqual([
    {
      at: "'Price_Valu'",
      message:
        `Argument of type '"Price_Valu"' is not assignable to parameter of type ` +
        `'"Price_Value" | "Height" | "With" | "Coin/Item_Value" | "Gem/Item_Value" | ` +
        `"Energy_Bar/Energy_Bar" | "Energy_Bar/Lives" | "Item_Value_Icon/Item_Value"'.`,
    },
  ]);
});

test('a wrong enum path is reported on the path', () => {
  const { errors } = languageService(
    `${PRELUDE}  useRiveEnum('Price_Value', instance);\n}\n`
  );
  expect(errors().map((e) => e.at)).toEqual(["'Price_Value'"]);
});

test('paths complete per hook kind', () => {
  expect(
    languageService(
      `${PRELUDE}  useRiveNumber(${CURSOR}'', instance);\n}\n`
    ).completions()
  ).toEqual([
    'Price_Value',
    'Height',
    'With',
    'Coin/Item_Value',
    'Gem/Item_Value',
    'Energy_Bar/Energy_Bar',
    'Energy_Bar/Lives',
    'Item_Value_Icon/Item_Value',
  ]);
});

test('a wrong viewModelName on a view ref is reported on the name', () => {
  const { errors } = languageService(
    `${PRELUDE.replace("viewModelName: 'Rewards'", "viewModelName: 'Reward'")}  return instance;\n}\n`
  );
  const [error, ...rest] = errors();
  expect(rest).toEqual([]);
  expect(error?.at).toBe('viewModelName');
  expect(error?.message).toContain(`Did you mean '"Rewards"'?`);
});

test('viewModelName completes from the asset schema', () => {
  expect(
    languageService(
      `${PRELUDE.replace("viewModelName: 'Rewards'", `viewModelName: ${CURSOR}''`)}  return instance;\n}\n`
    )
      .completions()
      ?.sort()
  ).toEqual(['Button', 'Energy_Bar', 'Item', 'Item_Icon_Value', 'Rewards']);
});
