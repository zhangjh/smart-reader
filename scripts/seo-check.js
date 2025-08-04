#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// SEO检查配置
const SEO_RULES = {
  title: {
    minLength: 30,
    maxLength: 60,
    required: true,
  },
  description: {
    minLength: 120,
    maxLength: 160,
    required: true,
  },
  keywords: {
    maxCount: 10,
    required: false,
  },
  h1: {
    maxCount: 1,
    required: true,
  },
  images: {
    requireAlt: true,
  },
};

// 检查页面文件
function checkPageFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const fileName = path.basename(filePath);

  console.log(`\n🔍 检查文件: ${fileName}`);

  // 检查是否有metadata导出
  if (!content.includes('export const metadata') && !content.includes('generateMetadata')) {
    issues.push('❌ 缺少metadata配置');
  }

  // 检查title配置
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  if (titleMatch) {
    const title = titleMatch[1];
    if (title.length < SEO_RULES.title.minLength) {
      issues.push(`⚠️ 标题过短: ${title.length}字符 (建议${SEO_RULES.title.minLength}-${SEO_RULES.title.maxLength}字符)`);
    }
    if (title.length > SEO_RULES.title.maxLength) {
      issues.push(`⚠️ 标题过长: ${title.length}字符 (建议${SEO_RULES.title.minLength}-${SEO_RULES.title.maxLength}字符)`);
    }
    console.log(`✅ 标题: ${title}`);
  } else if (SEO_RULES.title.required) {
    issues.push('❌ 缺少title配置');
  }

  // 检查description配置
  const descMatch = content.match(/description:\s*["']([^"']+)["']/);
  if (descMatch) {
    const description = descMatch[1];
    if (description.length < SEO_RULES.description.minLength) {
      issues.push(`⚠️ 描述过短: ${description.length}字符 (建议${SEO_RULES.description.minLength}-${SEO_RULES.description.maxLength}字符)`);
    }
    if (description.length > SEO_RULES.description.maxLength) {
      issues.push(`⚠️ 描述过长: ${description.length}字符 (建议${SEO_RULES.description.minLength}-${SEO_RULES.description.maxLength}字符)`);
    }
    console.log(`✅ 描述: ${description.substring(0, 50)}...`);
  } else if (SEO_RULES.description.required) {
    issues.push('❌ 缺少description配置');
  }

  // 检查keywords配置
  const keywordsMatch = content.match(/keywords:\s*["']([^"']+)["']/);
  if (keywordsMatch) {
    const keywords = keywordsMatch[1].split(',');
    if (keywords.length > SEO_RULES.keywords.maxCount) {
      issues.push(`⚠️ 关键词过多: ${keywords.length}个 (建议不超过${SEO_RULES.keywords.maxCount}个)`);
    }
    console.log(`✅ 关键词: ${keywords.length}个`);
  }

  // 检查H1标签
  const h1Matches = content.match(/<h1[^>]*>/g);
  if (h1Matches) {
    if (h1Matches.length > SEO_RULES.h1.maxCount) {
      issues.push(`⚠️ H1标签过多: ${h1Matches.length}个 (建议只有1个)`);
    } else {
      console.log(`✅ H1标签: ${h1Matches.length}个`);
    }
  } else if (SEO_RULES.h1.required) {
    issues.push('❌ 缺少H1标签');
  }

  // 检查图片alt属性
  const imgMatches = content.match(/<img[^>]*>/g) || [];
  const imagesWithoutAlt = imgMatches.filter(img => !img.includes('alt='));
  if (imagesWithoutAlt.length > 0) {
    issues.push(`⚠️ ${imagesWithoutAlt.length}个图片缺少alt属性`);
  } else if (imgMatches.length > 0) {
    console.log(`✅ 图片alt属性: ${imgMatches.length}个图片都有alt属性`);
  }

  // 检查结构化数据
  if (content.includes('application/ld+json')) {
    console.log('✅ 包含结构化数据');
  } else {
    issues.push('⚠️ 建议添加结构化数据');
  }

  // 检查canonical链接
  if (content.includes('canonical')) {
    console.log('✅ 包含canonical链接');
  } else {
    issues.push('⚠️ 建议添加canonical链接');
  }

  // 输出问题
  if (issues.length > 0) {
    console.log('\n📋 发现的问题:');
    issues.forEach(issue => console.log(`  ${issue}`));
  } else {
    console.log('\n✨ SEO检查通过!');
  }

  return issues;
}

// 检查sitemap文件
function checkSitemap() {
  const sitemapPath = path.join(__dirname, '../app/sitemap.ts');
  if (fs.existsSync(sitemapPath)) {
    console.log('\n🗺️ 检查sitemap.ts');
    const content = fs.readFileSync(sitemapPath, 'utf8');
    
    // 检查是否包含主要页面
    const requiredPages = ['/', '/reader', '/search', '/translation', '/history'];
    const missingPages = requiredPages.filter(page => {
      const pagePattern = page === '/' ? 'baseUrl,' : `\`\${baseUrl}${page}\``;
      return !content.includes(pagePattern);
    });
    
    if (missingPages.length > 0) {
      console.log(`⚠️ sitemap缺少页面: ${missingPages.join(', ')}`);
    } else {
      console.log('✅ sitemap包含所有主要页面');
    }

    // 检查优先级设置
    if (content.includes('priority:')) {
      console.log('✅ 设置了页面优先级');
    } else {
      console.log('⚠️ 建议设置页面优先级');
    }

    // 检查更新频率
    if (content.includes('changeFrequency:')) {
      console.log('✅ 设置了更新频率');
    } else {
      console.log('⚠️ 建议设置更新频率');
    }
  } else {
    console.log('❌ 缺少sitemap.ts文件');
  }
}

// 检查robots文件
function checkRobots() {
  const robotsPath = path.join(__dirname, '../app/robots.ts');
  if (fs.existsSync(robotsPath)) {
    console.log('\n🤖 检查robots.ts');
    const content = fs.readFileSync(robotsPath, 'utf8');
    
    if (content.includes('sitemap:')) {
      console.log('✅ robots.ts包含sitemap引用');
    } else {
      console.log('⚠️ robots.ts缺少sitemap引用');
    }

    if (content.includes('disallow:')) {
      console.log('✅ 设置了disallow规则');
    } else {
      console.log('⚠️ 建议设置disallow规则');
    }
  } else {
    console.log('❌ 缺少robots.ts文件');
  }
}

// 主函数
function main() {
  console.log('🚀 开始SEO检查...\n');

  const appDir = path.join(__dirname, '../app');
  const pageFiles = [];

  // 递归查找页面文件
  function findPageFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findPageFiles(filePath);
      } else if (file === 'page.tsx' || file === 'layout.tsx') {
        pageFiles.push(filePath);
      }
    });
  }

  findPageFiles(appDir);

  let totalIssues = 0;
  pageFiles.forEach(file => {
    const issues = checkPageFile(file);
    totalIssues += issues.length;
  });

  // 检查其他SEO文件
  checkSitemap();
  checkRobots();

  // 总结
  console.log('\n📊 SEO检查总结:');
  console.log(`检查了 ${pageFiles.length} 个页面文件`);
  console.log(`发现 ${totalIssues} 个问题`);

  if (totalIssues === 0) {
    console.log('🎉 恭喜! 所有SEO检查都通过了!');
  } else {
    console.log('💡 建议修复上述问题以提升SEO效果');
  }
}

// 运行检查
main();