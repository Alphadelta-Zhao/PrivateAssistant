<script setup>
import { ref } from 'vue';
import * as xlsx from 'xlsx';
const upload = ref(null);
const dictation = ref(null)
const showConfigPage = ref(false)
const questionAreaShow = ref(false)
const config = ref({
  begin: '',
  beginCode: -1,
  end: '',
  endCode: -1,
  top: -1,
  bottom: -1,

  questionCol: 'A',
  answerCol: 'B',
  num: 4
})
const handleExceed = (files) => {
  upload.value?.clearFiles()
  const file = files[0]
  upload.value?.handleStart(file)
}
const submitUpload = () => {
  questionAreaShow.value = false;
  upload.value?.submit()
}
const parseData = (header) => {
  let reader = new FileReader();
  reader.readAsBinaryString(header.file);
  reader.onload = () => {
    dictation.value = (xlsx.read(reader.result, {type: 'binary'}));

    let configKey = dictation.value.Sheets.Sheet1["!ref"].split(':');
    config.value.begin = configKey[0][0];
    config.value.end = configKey[1][0];
    config.value.top = parseInt(configKey[0].substring(1));
    config.value.bottom = parseInt(configKey[1].substring(1));

    config.value.beginCode = config.value.begin.charCodeAt(0);
    config.value.endCode = config.value.end.charCodeAt(0);

    if (config.value.begin === config.value.end || config.value.top === config.value.bottom) {
      alert('格式错误');
      return;
    }

    config.value.questionCol = config.value.begin;
    config.value.answerCol = config.value.end;

    showConfigPage.value = true;
  }
}
const getTableValue = (col, row) => {
  if (dictation && dictation.value && dictation.value.Sheets && dictation.value.Sheets.Sheet1) {
    let pos = col + row;
    if (dictation.value.Sheets.Sheet1[pos]) {
      return dictation.value.Sheets.Sheet1[pos]?.v;
    } else {
      return '';
    }
  } else {
    return '';
  }
}
const configPageConfirm = () => {
  showConfigPage.value = false;
  getQuestion();
  questionAreaShow.value = true;
}

const question = ref({
  key: '',
  option: [],
})
const getQuestion = () => {
  // 题干获取
  question.value.key = getRandom();
  let res = [question.value.key];
  for (let i = 1; i < config.value.num; i++) {
    let num = getRandom(res);
    res.push(num);
  }

  let sortAidArr = res.map((e, i, arr) => {
    return {
      weight: Math.random(),
      value: arr[i]
    }
  });
  sortAidArr.sort((a, b) => a.weight - b.weight);

  res = sortAidArr.map(e => e.value);
  question.value.option = [...res];
}
const getRandom = (avoids = []) => {
  let num = -1;
  while (avoids.indexOf(num) !== -1 || num === -1 || num === 1) {
    num = parseInt(Math.random()*(config.value.bottom - config.value.top) + config.value.top, 10);
  };
  return num;
}

const grade = ref({
  sum: 0,
  correct: 0,
  wrong: 0
})
const checkAns = (ans) => {
  grade.value.sum ++;
  if (ans === question.value.key) {
    ElMessage({
      message:'成功',
      type: 'success'
    })
    grade.value.correct++;
  } else {
    ElMessage({
      message:`失败  正解为：${getTableValue(config.value.answerCol, question.value.key)}`,
      type: 'error'
    })
    grade.value.wrong++;
  }
  getQuestion();
}
const reset = () => {
  grade.value.sum = 0;
  grade.value.correct = 0;
  grade.value.wrong = 0;
}
</script>

<template>
  <el-upload
    ref="upload"
    :limit="1"
    :on-exceed="handleExceed"
    :auto-upload="false"
    :accept="'.xlsx'"
    :http-request="parseData"
  >
    <template #trigger>
      <el-button type="primary">选择</el-button>
    </template>
    <el-button class="ml-3" type="success" @click="submitUpload">确定</el-button>
  </el-upload>
  <el-dialog v-model="showConfigPage" width="30%" draggable>
    题干：
    <el-radio-group v-model="config.questionCol">
      <el-radio
        v-for="i in (config.endCode + 1 - config.beginCode)"
        :key="i"
        :label="String.fromCharCode((config.beginCode + i - 1))"
        :disabled="(String.fromCharCode((config.beginCode + i -1)) === config.answerCol)"
      >
        {{getTableValue(String.fromCharCode((config.beginCode + i - 1)), 1)}}
      </el-radio>
    </el-radio-group>
    选择项：
    <el-radio-group v-model="config.answerCol">
      <el-radio
        v-for="i in (config.endCode + 1 - config.beginCode)"
        :key="i"
        :disabled="(String.fromCharCode((config.beginCode + i -1)) === config.questionCol)"
        :label="String.fromCharCode((config.beginCode + i - 1))"
      >
        {{getTableValue(String.fromCharCode((config.beginCode + i - 1)), 1)}}
      </el-radio>
    </el-radio-group>
    题干数量
    <el-slider :min="3" :max="10" v-model="config.num" :step="1" show-stops />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showConfigPage = false">取消</el-button>
        <el-button type="primary" @click="configPageConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
  <div v-if="(questionAreaShow && dictation !== null)">
    <div class="question">{{getTableValue(config.questionCol, question.key)}}?</div>
    <ul>
      <li v-for="item of question.option" :key="item" class="option" @click="checkAns(item)">
        {{getTableValue(config.answerCol, item)}}
      </li>
    </ul>
  </div>
  <div v-if="(questionAreaShow && grade.sum > 0)">
    <el-button type="primary" @click="reset">reset</el-button>
    <el-tag type="info">总：{{grade.sum}}</el-tag>
    <el-tag type="success">对：{{grade.correct}}</el-tag>
    <el-tag type="danger">错：{{grade.wrong}}</el-tag>
  </div>
</template>

<style lang="less" scoped>
.option {
  cursor: pointer;
}
</style>
