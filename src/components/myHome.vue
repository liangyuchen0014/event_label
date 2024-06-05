<template>
  <el-container>

    <el-aside width="30%" style="background-color: white; border: 10px  solid #eee">
      <el-upload action :limit="1" :on-change="uploadJSON" accpet=".json" :file-list="fileList">
        <el-button size="small" type="primary">点击上传JSON</el-button>
      </el-upload>
      <el-button type="primary" @click="downloadJSON">导出JSON</el-button>
      <el-table :data="originalJson" @row-click="eventRevise">
        <el-table-column prop="clipID" label="片段ID" width="80">
        </el-table-column>
        <el-table-column prop="event" label="事件动词" width="140">
        </el-table-column>
        <el-table-column prop="isRevised" label="是否已校对" width="120">
        </el-table-column>
      </el-table>
    </el-aside>
    <el-container>
      <el-header>
        <el-select v-model="event_value" placeholder="请选择释义" @change="updateParaphrase">
          <el-option v-for="item in event_options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-header>
      <el-main>
        <el-col :span="12">
          <el-table :data="revisingEvent">
            <el-table-column prop="argID" label="论元属性" width="140">
            </el-table-column>
            <el-table-column prop="value" label="值" width="280">
            </el-table-column>
            <el-table-column prop="meaning" label="含义" width="70">
            </el-table-column>
          </el-table>
        </el-col>
        <el-col :span="12">
          test
        </el-col>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      event_options: [{
        value: '选项1',
        label: '黄金糕'
      }],
      event_value: '',
      fileList: [],
      originalJson: [],
      revisingEvent: [],
      paraphraseList: [],
      newJson: []
    }
  },
  methods: {
    uploadJSON(file, fileList) {
      this.fileList = fileList;
      var reader = new FileReader();
      reader.readAsText(file.raw);
      reader.onload = (e) => {
        this.originalJson = JSON.parse(e.target.result)['clip'];
        this.originalJson.forEach(i => {
          i['isRevised'] = '否';
        });
      }
    },

    async eventRevise(row) {
      this.revisingEvent = [];
      this.event_value = row['event'];
      [
        'arg0_ins',
        'arg1_ins',
        'arg2_ins',
        'arg3_ins',
        'arg4_ins',
        'argM-LOC',
        'argM-EXT',
      ].forEach(argID => {
        let meaning = '';
        switch (argID.slice(3, 8)) {
          case '0_ins':
            meaning = '主体';
            break;
          case '1_ins':
            meaning = '客体';
            break;
          case '2_ins':
            meaning = '工具';
            break;
          case '3_ins':
            meaning = '目标/结果';
            break;
          case '4_ins':
            meaning = '来源';
            break;
          case 'M-LOC':
            meaning = '位置';
            break;
          case 'M-EXT':
            meaning = '程度';
            break;
          default:
            break;
        }
        const value = argID.includes('ins') ? row['instance'][argID] : row[argID]; // 检查是否属于 instance
        if (value != null && value != undefined) {
          this.revisingEvent.push({ 'argID': argID, 'value': value, 'meaning': meaning });
        }
      });
      this.updateEventOption(this.event_value);
    },
    downloadJSON() { },

    /**
     * 更新词汇释义索引。Updates the event option with the specified value.
     *
     * @param {any} motion - 动词。The value to update the event option with.
     */
    updateEventOption(motion) {
      fetch(`${process.env.BASE_URL}frames_json/${motion}.json`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
          else return response.json();
        })
        .then(data => {
          this.paraphraseList = data
          this.event_options = this.paraphraseList.map(item => {
            return {
              value: item["uid"],
              label: item["roleset_id"] + ': ' + item["roleset_name"]
            }
          });
        })
        .catch(error => {
          console.error('Error fetching and parsing JSON file:', error);
        });
    },
    updateParaphrase(uid_value) {
      this.paraphraseList.forEach(item => {
        if (item["uid"] == uid_value) {
          console.log('true');
          item["roles"].forEach(role => {
            this.newJson.push({ 'argID': role["n"], 'value': '', 'descr': role["descr"] });
          });
        }
      });
      console.log(this.newJson);
    }
  },
}

</script>

<style></style>